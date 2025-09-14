import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';

// Impor hanya controller yang dibutuhkan oleh pengguna
import {
  getUserDashboardData,
  createSubmission,
  // Jika ada, controller untuk detail event publik bisa ditambahkan di sini
} from '../controllers/events.controller.js';

const router = Router();

// =================================================================
// RUTE INI KHUSUS UNTUK PENGGUNA YANG TELAH LOGIN
// =================================================================

// Endpoint untuk mengambil semua data dashboard
// URL Akhir: GET /api/events/dashboard
router.get('/dashboard', authenticateToken, getUserDashboardData);

// Endpoint untuk mengirim atau memperbarui karya
// URL Akhir: POST /api/events/123/submissions
router.post('/:id/submissions', authenticateToken, createSubmission);

// Endpoint untuk detail event publik (jika ada)
// URL Akhir: GET /api/events/123
// router.get('/:id', getPublicEventDetails);

export default router;