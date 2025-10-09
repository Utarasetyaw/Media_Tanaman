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

// --- RUTE PUBLIK & PENGGUNA (TIDAK TERMASUK DALAM /management) ---
// Rute ini harus dipisahkan ke file lain atau server.js
// Untuk saat ini, kita fokus pada rute admin

// --- RUTE ADMIN (SEMUA DI BAWAH PREFIX /management) ---
router.use(authenticateToken, authorizeRoles(['ADMIN']));

// GET /api/events/management/
router.get('/', getManagementEvents);

// POST /api/events/management/
router.post(
  '/', 
  upload.single('image'),
  convertToWebp('events'),
  createEvent
);

// PUT /api/events/management/submissions/:submissionId/placement
router.put('/submissions/:submissionId/placement', setSubmissionPlacement);

// GET /api/events/management/:id
router.get('/:id', getEventByIdForAdmin);

// PUT /api/events/management/:id
router.put(
  '/:id', 
  upload.single('image'),
  convertToWebp('events'),
  updateEvent
);

// DELETE /api/events/management/:id
router.delete('/:id', deleteEvent);

// GET /api/events/management/:id/submissions
router.get('/:id/submissions', getSubmissionsForEvent);

export default router;