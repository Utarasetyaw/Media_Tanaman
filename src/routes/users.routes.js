import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMySubmissions,
  getUserDashboardData,
  updateMyProfile, // <-- 1. Impor fungsi controller yang baru
} from '../controllers/users.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// =================================================================
// RUTE PENGGUNA TERAUTENTIKASI (Untuk Profil Sendiri)
// =================================================================

// Rute untuk mengambil semua data dashboard pengguna.
router.get('/me/dashboard', authenticateToken, getUserDashboardData);

// Rute untuk mengambil riwayat submission pengguna.
router.get('/me/submissions', authenticateToken, getMySubmissions);

// 2. RUTE BARU UNTUK UPDATE PROFIL PENGGUNA
// Rute ini dipanggil saat user menekan tombol simpan di modal profil.
router.put('/me/profile', authenticateToken, updateMyProfile);


// =================================================================
// RUTE KHUSUS ADMIN (Untuk Mengelola Pengguna Lain)
// =================================================================

// Middleware di bawah ini akan melindungi semua rute admin setelahnya.
router.use(authenticateToken, authorizeRoles(['ADMIN']));

// Rute untuk /api/users
router.route('/')
  .post(createUser)    // Membuat user baru (ADMIN / JURNALIS)
  .get(getAllUsers);   // Melihat semua user

// Rute untuk /api/users/:id
router.route('/:id')
  .get(getUserById)    // Melihat detail satu user
  .put(updateUser)     // Mengupdate user
  .delete(deleteUser); // Menghapus user

export default router;