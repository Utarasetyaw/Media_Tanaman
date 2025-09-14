// src/routes/upload.routes.js

import { Router } from 'express';
import { createUploader } from '../middlewares/upload.middleware.js';
import { validateUploadType, uploadImage } from '../controllers/upload.controller.js';

const router = Router();

// Rute dinamis: POST /api/upload/:type
// Contoh: /api/upload/artikel, /api/upload/events
router.post(
  '/:type',
  validateUploadType, // 1. Validasi dulu tipenya
  (req, res, next) => { // 2. Buat uploader berdasarkan tipe
    const uploader = createUploader(req.params.type);
    uploader.single('image')(req, res, next); // 3. Jalankan upload
  },
  uploadImage // 4. Kirim respons JSON
);

export default router;