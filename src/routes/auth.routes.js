// routes/auth.routes.js

import { Router } from 'express';
import { 
  registerParticipant,
  registerJournalist,
  loginAdmin,
  loginJournalist,
  loginParticipant,
  getProfile,
  logout
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// =================================================================
// RUTE PUBLIK (Tidak Perlu Login)
// =================================================================

// --- Rute Registrasi ---
router.post('/register/participant', registerParticipant);
router.post('/register/journalist', registerJournalist);

// --- Rute Login ---
router.post('/login/admin', loginAdmin);
router.post('/login/journalist', loginJournalist);
router.post('/login/participant', loginParticipant);

// =================================================================
// RUTE TERPROTEKSI (Wajib Login / Menggunakan Token)
// =================================================================

// Mendapatkan profil pengguna yang sedang login
router.get('/profile', authenticateToken, getProfile);

// Logout
router.post('/logout', authenticateToken, logout);


export default router;