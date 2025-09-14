import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

// Impor semua fungsi controller yang relevan
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

const router = Router();

// =================================================================
// PENDAFTARAN RUTE PUBLIK & PENGGUNA (NON-ADMIN)
// =================================================================

// --- Rute Dashboard Pengguna ---
// Diletakkan di sini, terpisah dari logika admin
router.get('/dashboard', authenticateToken, getUserDashboardData);

// --- Rute Submission oleh Pengguna ---
router.post('/:id/submissions', authenticateToken, createSubmission);


// =================================================================
// PENDAFTARAN RUTE ADMIN
// =================================================================
// Rute di bawah ini akan aktif jika server.js menunjuk ke file ini
// melalui /api/events/management

// Middleware untuk semua rute admin di file ini
router.use(authenticateToken);
router.use(authorizeRoles(['ADMIN']));

// --- Rute Utama Manajemen ---
// Cocok untuk: GET /api/events/management & POST /api/events/management
router.route('/')
    .get(getManagementEvents)
    .post(createEvent);

// --- Rute Spesifik Submission Admin ---
// Cocok untuk: PUT /api/events/management/submissions/:submissionId/placement
router.put('/submissions/:submissionId/placement', setSubmissionPlacement);

// --- Rute Manajemen Berdasarkan ID Event ---
// Cocok untuk: GET, PUT, DELETE /api/events/management/:id
router.route('/:id')
    .get(getEventByIdForAdmin)
    .put(updateEvent)
    .delete(deleteEvent);

// Cocok untuk: GET /api/events/management/:id/submissions
router.get('/:id/submissions', getSubmissionsForEvent);


export default router;