import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  createPlant,
  updatePlant,
  deletePlant,
  getManagementPlants,
  getPlantByIdForAdmin
} from '../controllers/plants.controller.js';

// 1. Import middleware yang dibutuhkan
import { upload } from '../middlewares/upload.middleware.js';
import { convertToWebp } from '../middlewares/image.middleware.js';

const router = Router();

// Middleware ini akan melindungi semua rute yang didefinisikan setelahnya
router.use(authenticateToken, authorizeRoles(['ADMIN']));

// Rute untuk mendapatkan daftar tanaman
router.get('/', getManagementPlants);

// 2. Modifikasi Rute POST (Create)
// Tambahkan middleware upload dan konversi
router.post(
    '/', 
    upload.single('image'),      // Tangkap file 'image' ke memori
    convertToWebp('plants'),     // Konversi ke webp dan simpan di folder 'plants'
    createPlant                  // Controller akan menerima req.file
);

// Rute untuk detail (GET) dan hapus (DELETE) berdasarkan ID
router.get('/:id', getPlantByIdForAdmin);
router.delete('/:id', deletePlant);

// 3. Modifikasi Rute PUT (Update)
// Tambahkan middleware upload dan konversi (opsional)
router.put(
    '/:id', 
    upload.single('image'),      // Tangkap file 'image' jika ada
    convertToWebp('plants'),     // Konversi jika file diunggah
    updatePlant                  // Controller akan cek apakah req.file ada
);

export default router;