import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transformEventImage = (req, event) => {
  if (event?.imageUrl && event.imageUrl.startsWith('/')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { ...event, imageUrl: `${baseUrl}${event.imageUrl}` };
  }
  return event;
};

const transformRelativePath = (req, relativePath) => {
  if (relativePath && relativePath.startsWith('/')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}${relativePath}`;
  }
  return relativePath;
};

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

export const createEvent = async (req, res) => {
  const { title, description, location, organizer, startDate, endDate, eventType, externalUrl } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'File gambar wajib diunggah.' });
  }
  const imageUrl = `/uploads/events/${req.file.filename}`;

  if (!title || !startDate || !endDate || !eventType) {
    return res.status(400).json({ error: 'Field yang wajib diisi belum lengkap.' });
  }
  try {
    const newEvent = await prisma.event.create({
      data: {
        title: JSON.parse(title),
        description: JSON.parse(description),
        imageUrl,
        location, organizer, eventType, externalUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    res.status(201).json(transformEventImage(req, newEvent));
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(400).json({ error: 'Gagal membuat event. Periksa format data Anda.' });
  }
};

export const updateEvent = async (req, res) => {
  const { id } = req.params;
  const eventId = parseInt(id);
  if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid event ID' });

  const { title, description, location, organizer, startDate, endDate, eventType, externalUrl } = req.body;
  const dataToUpdate = {};

  if (title) dataToUpdate.title = JSON.parse(title);
  if (description) dataToUpdate.description = JSON.parse(description);
  if (location) dataToUpdate.location = location;
  if (organizer) dataToUpdate.organizer = organizer;
  if (eventType) dataToUpdate.eventType = eventType;
  if (externalUrl !== undefined) dataToUpdate.externalUrl = externalUrl;
  if (startDate) dataToUpdate.startDate = new Date(startDate);
  if (endDate) dataToUpdate.endDate = new Date(endDate);

  if (req.file) {
      dataToUpdate.imageUrl = `/uploads/events/${req.file.filename}`;
  }

  try {
    if (req.file) {
      const oldEvent = await prisma.event.findUnique({ where: { id: eventId } });
      if (oldEvent?.imageUrl && !oldEvent.imageUrl.startsWith('http')) {
        const oldImagePath = path.join(__dirname, '../../public', oldEvent.imageUrl);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
    }
    const updatedEvent = await prisma.event.update({ where: { id: eventId }, data: dataToUpdate });
    res.json(transformEventImage(req, updatedEvent));
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(404).json({ error: 'Event not found or failed to update' });
  }
};

export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const eventId = parseInt(id);
  if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid Event ID.' });

  try {
    const event = await prisma.event.findUnique({ 
        where: { id: eventId },
        include: {
            submissions: true // Ambil SEMUA submission
        } 
    });

    if (!event) {
        return res.status(404).json({ error: 'Event not found.' });
    }

    const isEventFinished = new Date(event.endDate) < new Date();
    const hasWinner = event.submissions.some(sub => sub.placement !== null);

    if (isEventFinished && hasWinner) {
        return res.status(403).json({ error: 'Event yang sudah selesai dan memiliki pemenang tidak dapat dihapus.' });
    }

    // 1. Hapus semua file gambar dari submission peserta
    if (event.submissions && event.submissions.length > 0) {
        for (const submission of event.submissions) {
            if (submission.submissionUrl && !submission.submissionUrl.startsWith('http')) {
                const submissionImagePath = path.join(__dirname, '../../public', submission.submissionUrl);
                if (fs.existsSync(submissionImagePath)) {
                    fs.unlinkSync(submissionImagePath);
                }
            }
        }
    }

    // 2. Hapus file gambar utama event
    if (event.imageUrl && !event.imageUrl.startsWith('http')) {
        const imagePath = path.join(__dirname, '../../public', event.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }
    
    // 3. Hapus data event dari database (submission akan ikut terhapus otomatis)
    await prisma.event.delete({ where: { id: eventId } });
    res.status(204).send();
    
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
};

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

        allInternalEvents.forEach(event => {
            const userSubmission = event.submissions.length > 0 ? event.submissions[0] : null;
            const transformedEvent = transformEventImage(req, event);
            
            const startDate = new Date(transformedEvent.startDate);
            const endDate = new Date(transformedEvent.endDate);

            if (endDate < now) {
                if (userSubmission) {
                    pastEventsHistory.push({
                        id: transformedEvent.id,
                        title: transformedEvent.title,
                        imageUrl: transformedEvent.imageUrl,
                        startDate: transformedEvent.startDate,
                        endDate: transformedEvent.endDate,
                        submission: {
                            id: userSubmission.id,
                            submissionUrl: transformRelativePath(req, userSubmission.submissionUrl),
                            placement: userSubmission.placement,
                        }
                    });
                }
            } else if (startDate <= now && endDate >= now) {
                openForSubmission.push({
                    id: transformedEvent.id,
                    title: transformedEvent.title,
                    imageUrl: transformedEvent.imageUrl,
                    startDate: transformedEvent.startDate,
                    endDate: transformedEvent.endDate,
                    submission: userSubmission 
                        ? {
                            ...userSubmission,
                            submissionUrl: transformRelativePath(req, userSubmission.submissionUrl),
                          }
                        : null,
                });
            } else {
                upcomingEvents.push({
                    id: transformedEvent.id,
                    title: transformedEvent.title,
                    imageUrl: transformedEvent.imageUrl,
                    startDate: transformedEvent.startDate,
                    endDate: transformedEvent.endDate,
                });
            }
        });
        
        const currentUserProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: { address: true, phoneNumber: true, socialMedia: true }
        });

        const isProfileComplete = !!(currentUserProfile?.address && currentUserProfile?.phoneNumber);
        
        const dashboardData = {
            stats: {
                participated: pastEventsHistory.length,
                open: openForSubmission.length,
                upcoming: upcomingEvents.length
            },
            openForSubmission,
            upcomingEvents,
            pastEventsHistory: pastEventsHistory.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()),
            isProfileComplete,
            currentUserProfile,
        };

        res.json(dashboardData);

    } catch (error) {
        console.error("Get User Dashboard Error:", error);
        res.status(500).json({ error: 'Failed to fetch dashboard data.' });
    }
};

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