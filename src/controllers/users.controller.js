import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const userSelection = {
  id: true,
  email: true,
  name: true,
  role: true,
  address: true,
  phoneNumber: true,
  socialMedia: true,
  createdAt: true,
  updatedAt: true,
};

const transformImageUrl = (req, item) => {
  if (item && item.imageUrl && item.imageUrl.startsWith('/')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { ...item, imageUrl: `${baseUrl}${item.imageUrl}` };
  }
  return item;
};

const transformRelativePath = (req, relativePath) => {
  if (relativePath && relativePath.startsWith('/')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}${relativePath}`;
  }
  return relativePath;
};

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const allowedRoles = ['ADMIN', 'JOURNALIST'];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${allowedRoles.join(', ')}` });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'JOURNALIST' },
      select: userSelection,
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Could not create user' });
  }
};

export const getAllUsers = async (req, res) => {
  const { role } = req.query;
  try {
    const whereClause = role ? { role: role.toUpperCase() } : {};
    const users = await prisma.user.findMany({
      where: whereClause,
      select: { 
        ...userSelection, 
        _count: { 
          select: { 
            articles: true 
          } 
        },
        articles: {
          where: { status: 'PUBLISHED' },
          select: { id: true }
        }
      },
      orderBy: { name: 'asc' },
    });

    const usersWithStats = users.map(user => {
      const { _count, articles, ...rest } = user;
      return {
        ...rest,
        articleStats: {
          total: _count.articles,
          published: articles.length
        }
      };
    });

    res.json(usersWithStats);
  } catch (error) {
      console.error("Get All Users Error:", error);
      res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);
  
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  
  try {
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: {
            ...userSelection,
            articles: {
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    viewCount: true,
                }
            }
        }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if(user.articles) {
        user.articles = user.articles.map(article => transformImageUrl(req, article));
    }

    res.json(user);
  } catch (error) {
    console.error("Get User by ID Error:", error);
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);
  const { name, email, role, address, phoneNumber, socialMedia, password } = req.body;
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });

  const dataToUpdate = { name, email, role, address, phoneNumber, socialMedia };
  if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: userSelection,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(404).json({ error: 'User not found or invalid data' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            articles: {
              where: { status: 'PUBLISHED' }
            }
          }
        }
      }
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userToDelete.role === 'JOURNALIST' && userToDelete._count.articles > 0) {
      return res.status(403).json({ 
        error: `Jurnalis ini tidak dapat dihapus karena memiliki ${userToDelete._count.articles} artikel yang sudah diterbitkan. Hapus atau pindahkan artikelnya terlebih dahulu.` 
      });
    }
    
    await prisma.user.delete({ where: { id: userId } });
    res.status(204).send();
    
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};

export const updateMyProfile = async (req, res) => {
  const userId = req.user.userId;
  const { address, phoneNumber, socialMedia } = req.body;

  if (!address || !phoneNumber) {
    return res.status(400).json({ error: "Alamat dan No. Telepon wajib diisi." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        address,
        phoneNumber,
        socialMedia: socialMedia || null,
      },
      select: userSelection,
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Update My Profile Error:", error);
    res.status(500).json({ error: "Gagal memperbarui profil." });
  }
};

export const getMySubmissions = async (req, res) => {
  const userId = req.user.userId;
  try {
    const submissions = await prisma.eventSubmission.findMany({
      where: { userId: userId },
      orderBy: { event: { startDate: 'desc' } },
      include: {
        event: {
          select: { id: true, title: true, imageUrl: true, startDate: true, endDate: true }
        }
      }
    });
    const transformedSubmissions = submissions.map(sub => {
        if (sub.event) { sub.event = transformImageUrl(req, sub.event); }
        return sub;
    });
    res.json(transformedSubmissions);
  } catch (error) {
    console.error("Get My Submissions Error:", error);
    res.status(500).json({ error: "Failed to fetch submission history." });
  }
};

export const getUserDashboardData = async (req, res) => {
  const userId = req.user.userId;

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { address: true, phoneNumber: true, socialMedia: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const isProfileComplete = !!(currentUser.address && currentUser.phoneNumber);

    const now = new Date();
    const events = await prisma.event.findMany({
      where: { eventType: 'INTERNAL' },
      orderBy: { startDate: 'desc' },
      include: { submissions: { where: { userId } } },
    });

    const openForSubmission = [];
    const upcomingEvents = [];
    const pastEventsHistory = [];

    events.forEach(event => {
      const eventWithUrl = transformImageUrl(req, event);
      const submission = event.submissions.length > 0 ? event.submissions[0] : null;

      const formattedSubmission = submission
        ? {
            ...submission,
            submissionUrl: transformRelativePath(req, submission.submissionUrl),
          }
        : null;

      const formattedEvent = {
        id: eventWithUrl.id,
        title: eventWithUrl.title,
        imageUrl: eventWithUrl.imageUrl,
        startDate: eventWithUrl.startDate,
        endDate: eventWithUrl.endDate,
        submission: formattedSubmission,
      };
      
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      if (endDate < now) {
        if (submission) pastEventsHistory.push(formattedEvent);
      } else if (startDate > now) {
        upcomingEvents.push(formattedEvent);
      } else {
        openForSubmission.push(formattedEvent);
      }
    });

    const stats = {
      open: openForSubmission.length,
      upcoming: upcomingEvents.length,
      participated: pastEventsHistory.length,
    };
    
    res.json({
      stats,
      openForSubmission,
      upcomingEvents,
      pastEventsHistory,
      isProfileComplete,
      currentUserProfile: currentUser,
    });

  } catch (error) {
    console.error("Get User Dashboard Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};