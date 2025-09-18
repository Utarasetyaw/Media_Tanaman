import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- HELPER UNTUK TRANSFORMASI URL GAMBAR ---
const transformEventImage = (req, event) => {
  if (event?.imageUrl && event.imageUrl.startsWith('/')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { ...event, imageUrl: `${baseUrl}${event.imageUrl}` };
  }
  return event;
};

// =================================================================
// RUTE-RUTE MANAJEMEN ADMIN
// =================================================================

/**
 * ADMIN: Mengambil semua event untuk halaman manajemen.
 */
export const getManagementEvents = async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { startDate: 'desc' },
        });
        res.json(events.map(event => transformEventImage(req, event)));
    } catch (error) {
        console.error("Get Management Events Error:", error);
        res.status(500).json({ error: 'Failed to fetch events for management.' });
    }
};

/**
 * ADMIN: Mengambil detail satu event untuk halaman manajemen.
 */
export const getEventByIdForAdmin = async (req, res) => {
    const { id } = req.params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid Event ID.' });

    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                submissions: {
                    orderBy: { createdAt: 'desc' },
                    include: { 
                        user: { 
                            select: { 
                                id: true, name: true, email: true, 
                                address: true, phoneNumber: true, socialMedia: true 
                            } 
                        } 
                    }
                }
            }
        });
        if (!event) return res.status(404).json({ error: 'Event not found' });
        
        if (event.submissions) {
            event.submissions = event.submissions.map(sub => ({
                ...sub,
                submissionUrl: transformEventImage(req, { imageUrl: sub.submissionUrl }).imageUrl,
            }));
        }

        res.json(transformEventImage(req, event));
    } catch(error) {
        console.error("Get Event By ID for Admin Error:", error);
        res.status(500).json({ error: 'Failed to fetch event details.' });
    }
};

/**
 * ADMIN: Membuat event baru.
 */
export const createEvent = async (req, res) => {
  const { title, description, imageUrl, location, organizer, startDate, endDate, eventType, externalUrl } = req.body;
  if (!title || !description || !imageUrl || !location || !organizer || !startDate || !endDate || !eventType) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }
  try {
    const newEvent = await prisma.event.create({
      data: {
        title, description, imageUrl, location, organizer, eventType, externalUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.status(201).json(transformEventImage(req, newEvent));
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(400).json({ error: 'Failed to create event.' });
  }
};

/**
 * ADMIN: Memperbarui data event.
 */
export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const eventId = parseInt(id);
  if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid event ID' });

  const data = req.body;
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  try {
    if (data.imageUrl) {
      const oldEvent = await prisma.event.findUnique({ where: { id: eventId } });
      if (oldEvent?.imageUrl && oldEvent.imageUrl !== data.imageUrl && !oldEvent.imageUrl.startsWith('http')) {
        const oldImageName = oldEvent.imageUrl.split('/').pop();
        const oldImagePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'events', oldImageName);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    }
    const updatedEvent = await prisma.event.update({ where: { id: eventId }, data });
    res.json(transformEventImage(req, updatedEvent));
  } catch (error) {
    res.status(404).json({ error: 'Event not found or failed to update' });
  }
};

/**
 * ADMIN: Menghapus event.
 */
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const eventId = parseInt(id);
  if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid Event ID.' });
  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (event?.imageUrl && !event.imageUrl.startsWith('http')) {
        const imageName = event.imageUrl.split('/').pop();
        const imagePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'events', imageName);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await prisma.event.delete({ where: { id: eventId } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Event not found' });
  }
};

// =================================================================
// --- DASHBOARD DAN FUNGSI PENGGUNA ---
// =================================================================

/**
 * USER: Mengambil data komprehensif untuk dashboard peserta.
 */
export const getUserDashboardData = async (req, res) => {
    const userId = req.user.userId;
    const now = new Date();

    try {
        const allInternalEvents = await prisma.event.findMany({
            where: { eventType: 'INTERNAL' },
            orderBy: { startDate: 'asc' },
            include: {
                submissions: {
                    where: { userId: userId }
                }
            }
        });

        const openForSubmission = [];
        const upcomingEvents = [];
        const pastEventsHistory = [];

        // --- GANTI BLOK INI ---
        allInternalEvents.forEach(event => {
            const userSubmission = event.submissions.length > 0 ? event.submissions[0] : null;
            const transformedEvent = transformEventImage(req, event);
            
            // Definisikan tanggal di awal agar lebih mudah dibaca
            const startDate = new Date(transformedEvent.startDate);
            const endDate = new Date(transformedEvent.endDate);

            if (endDate < now) {
                // Event sudah berakhir -> Masuk riwayat jika ada submission
                if (userSubmission) {
                    pastEventsHistory.push({
                        id: transformedEvent.id,
                        title: transformedEvent.title,
                        imageUrl: transformedEvent.imageUrl,
                        startDate: transformedEvent.startDate,
                        endDate: transformedEvent.endDate,
                        submission: {
                            id: userSubmission.id,
                            submissionUrl: userSubmission.submissionUrl,
                            placement: userSubmission.placement,
                        }
                    });
                }
            } else if (startDate <= now && endDate >= now) {
                // Event sedang berlangsung (terbuka) -> Tambahkan kondisi `endDate >= now`
                openForSubmission.push({
                    id: transformedEvent.id,
                    title: transformedEvent.title,
                    imageUrl: transformedEvent.imageUrl,
                    startDate: transformedEvent.startDate,
                    endDate: transformedEvent.endDate,
                    submission: userSubmission
                });
            } else {
                // Sisanya pasti event yang akan datang (`startDate > now`)
                upcomingEvents.push({
                    id: transformedEvent.id,
                    title: transformedEvent.title,
                    imageUrl: transformedEvent.imageUrl,
                    startDate: transformedEvent.startDate,
                    endDate: transformedEvent.endDate,
                });
            }
        });
        // --- AKHIR BLOK PENGGANTIAN ---
        
        const dashboardData = {
            stats: {
                participated: pastEventsHistory.length,
                open: openForSubmission.length,
                upcoming: upcomingEvents.length
            },
            openForSubmission,
            upcomingEvents,
            pastEventsHistory: pastEventsHistory.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
        };

        res.json(dashboardData);

    } catch (error) {
        console.error("Get User Dashboard Error:", error);
        res.status(500).json({ error: 'Failed to fetch dashboard data.' });
    }
};

// =================================================================
// --- MANAJEMEN SUBMISSION OLEH PESERTA & ADMIN ---
// =================================================================

/**
 * PESERTA: Mengirimkan atau memperbarui karya/submission ke sebuah event.
 */
export const createSubmission = async (req, res) => {
  const { id } = req.params;
  const eventId = parseInt(id);
  const { submissionUrl, submissionNotes } = req.body; 
  const userId = req.user.userId;
  
  if (!submissionUrl || isNaN(eventId)) {
    return res.status(400).json({ error: 'Submission URL and valid Event ID are required.' });
  }

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.eventType !== 'INTERNAL' || new Date(event.endDate) < new Date()) {
      return res.status(404).json({ error: 'Competition not found or is not open for submission.' });
    }

    const existingSubmission = await prisma.eventSubmission.findFirst({ 
        where: { eventId, userId }
    });
    
    if (existingSubmission) {
        const updatedSubmission = await prisma.eventSubmission.update({
            where: { id: existingSubmission.id },
            data: { submissionUrl, submissionNotes }
        });
        return res.status(200).json({ message: 'Submission updated successfully!', data: updatedSubmission });
    } else {
        const newSubmission = await prisma.eventSubmission.create({
          data: { eventId, userId, submissionUrl, submissionNotes },
        });
        return res.status(201).json({ message: 'Submission created successfully!', data: newSubmission });
    }
  } catch (error) {
    console.error("Create/Update Submission Error:", error);
    res.status(500).json({ error: 'Could not process submission.' });
  }
};

/**
 * ADMIN: Melihat semua submission untuk sebuah event.
 */
export const getSubmissionsForEvent = async (req, res) => {
    const { id } = req.params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid Event ID.' });
    try {
        const submissions = await prisma.eventSubmission.findMany({
            where: { eventId },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, name: true, email: true } } }
        });
        res.json(submissions);
    } catch (error) {
        res.status(404).json({ error: 'Event not found' });
    }
};

/**
 * ADMIN: Menentukan peringkat/juara untuk sebuah submission.
 */
export const setSubmissionPlacement = async (req, res) => {
    const { submissionId } = req.params;
    const { placement } = req.body;
    const submissionIdNum = parseInt(submissionId);
    if (isNaN(submissionIdNum)) return res.status(400).json({ error: 'Invalid Submission ID.' });

    try {
        const placementValue = placement !== null ? parseInt(placement) : null;
        if (placement !== null && isNaN(placementValue)) {
            return res.status(400).json({ error: "Placement must be a number or null."});
        }
        
        const updatedSubmission = await prisma.eventSubmission.update({
            where: { id: submissionIdNum },
            data: { placement: placementValue }
        });

        if (placementValue === 1) {
            await prisma.event.update({
                where: { id: updatedSubmission.eventId },
                data: { endDate: new Date() }
            });
        }

        res.json({ message: "Placement updated successfully", data: updatedSubmission });
    } catch (error) {
        console.error("Set Placement Error:", error);
        res.status(404).json({ error: 'Submission not found.' });
    }
};