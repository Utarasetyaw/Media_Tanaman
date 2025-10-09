// src/routes/upload.routes.js

import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { convertToWebp } from '../middlewares/image.middleware.js';
import { handleUpload, validateFolder } from '../controllers/upload.controller.js';

const router = Router();

// Terapkan otentikasi untuk semua rute unggahan
router.use(authenticateToken, authorizeRoles(['ADMIN', 'JOURNALIST']));

// RUTE KHUSUS UNTUK FAVICON (TANPA KONVERSI WEBP)
// Rute ini sudah benar, tidak perlu diubah.
router.post(
  '/favicon',
  (req, res, next) => {
    req.uploadFolder = 'settings'; 
    next();
  },
  upload.single('image'),
  handleUpload
);


// RUTE UMUM UNTUK GAMBAR LAIN (DENGAN KONVERSI WEBP)
router.post(
  '/:folder',
  validateFolder,
  upload.single('image'),
  // ▼▼▼ PERBAIKAN DI SINI ▼▼▼
  // Ubah dari: convertToWebp()
  // Menjadi:
  convertToWebp,
  // ▲▲▲ AKHIR PERBAIKAN ▲▲▲
  handleUpload
);

export default router;