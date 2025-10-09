import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  createPlant,
  updatePlant,
  deletePlant,
  getManagementPlants,
  getPlantByIdForAdmin
} from '../controllers/plants.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { convertToWebp } from '../middlewares/image.middleware.js';

const router = Router();

// Middleware ini akan melindungi semua rute yang didefinisikan setelahnya
router.use(authenticateToken, authorizeRoles(['ADMIN']));

// Rute untuk mendapatkan daftar tanaman
router.get('/', getManagementPlants);

// ▼▼▼ PERBAIKAN RUTE CREATE PLANT ▼▼▼
router.post(
    '/', 
    upload.single('image'),      // Tangkap file 'image' ke memori
    // 1. Set nama folder tujuan di request
    (req, res, next) => {
        req.uploadFolder = 'plants';
        next();
    },
    // 2. Panggil middleware convertToWebp secara langsung
    convertToWebp,
    createPlant
);
// ▲▲▲ AKHIR PERBAIKAN ▲▲▲

// Rute untuk detail (GET) dan hapus (DELETE) berdasarkan ID
router.get('/:id', getPlantByIdForAdmin);
router.delete('/:id', deletePlant);

// ▼▼▼ PERBAIKAN RUTE UPDATE PLANT ▼▼▼
router.put(
    '/:id', 
    upload.single('image'),      // Tangkap file 'image' jika ada
    // 1. Set nama folder tujuan di request
    (req, res, next) => {
        req.uploadFolder = 'plants';
        next();
    },
    // 2. Panggil middleware convertToWebp secara langsung
    convertToWebp,
    updatePlant
);
// ▲▲▲ AKHIR PERBAIKAN ▲▲▲

export default router;