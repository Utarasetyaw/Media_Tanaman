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
// Middleware berjalan berurutan: autentikasi -> upload -> handleUpload
router.post(
  '/favicon',
  (req, res, next) => {
    // Set folder tujuan secara manual untuk controller
    req.uploadFolder = 'settings'; 
    next();
  },
  upload.single('image'), // Middleware Multer untuk menyimpan file
  handleUpload          // Controller untuk mengirim respons
);


// RUTE UMUM UNTUK GAMBAR LAIN (DENGAN KONVERSI WEBP)
// Middleware berjalan berurutan: autentikasi -> validasi -> upload -> konversi -> handleUpload
router.post(
  '/:folder',
  validateFolder,              // Pastikan nama folder valid
  upload.single('image'),      // Middleware Multer untuk menyimpan file
  convertToWebp(),             // Middleware untuk konversi ke WebP
  handleUpload                 // Controller untuk mengirim respons
);

export default router;