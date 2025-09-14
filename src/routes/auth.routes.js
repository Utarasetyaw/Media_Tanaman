import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  getProfile
} from '../controllers/auth.controller.js';
// REVISI: Ganti nama fungsi yang diimpor menjadi 'authenticateToken'
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// =================================================================
// RUTE PUBLIK (Tidak Perlu Login)
// =================================================================

router.post('/register', register);
router.post('/login', login);

// =================================================================
// RUTE TERPROTEKSI (Wajib Login / Menggunakan Token)
// =================================================================

// REVISI: Gunakan 'authenticateToken'
router.get('/profile', authenticateToken, getProfile);

// REVISI: Gunakan 'authenticateToken'
router.post('/logout', authenticateToken, logout);


export default router;