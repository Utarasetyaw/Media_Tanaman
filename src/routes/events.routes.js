import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  createSubmission,
  getSubmissionsForEvent,
  setSubmissionPlacement,
  getManagementEvents,
  getEventByIdForAdmin,
  getUserDashboardData,
} from '../controllers/events.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { convertToWebp } from '../middlewares/image.middleware.js';

const router = Router();

// Fokus pada rute admin untuk saat ini
router.use(authenticateToken, authorizeRoles(['ADMIN']));

// GET /api/events/management/
router.get('/', getManagementEvents);

// ▼▼▼ PERBAIKAN RUTE CREATE EVENT ▼▼▼
router.post(
  '/', 
  upload.single('image'),
  // 1. Set nama folder tujuan di request
  (req, res, next) => {
      req.uploadFolder = 'events';
      next();
  },
  // 2. Panggil middleware convertToWebp secara langsung
  convertToWebp,
  createEvent
);
// ▲▲▲ AKHIR PERBAIKAN ▲▲▲

// PUT /api/events/management/submissions/:submissionId/placement
router.put('/submissions/:submissionId/placement', setSubmissionPlacement);

// GET /api/events/management/:id
router.get('/:id', getEventByIdForAdmin);

// ▼▼▼ PERBAIKAN RUTE UPDATE EVENT ▼▼▼
router.put(
  '/:id', 
  upload.single('image'),
  // 1. Set nama folder tujuan di request
  (req, res, next) => {
      req.uploadFolder = 'events';
      next();
  },
  // 2. Panggil middleware convertToWebp secara langsung
  convertToWebp,
  updateEvent
);
// ▲▲▲ AKHIR PERBAIKAN ▲▲▲

// DELETE /api/events/management/:id
router.delete('/:id', deleteEvent);

// GET /api/events/management/:id/submissions
router.get('/:id/submissions', getSubmissionsForEvent);

export default router;