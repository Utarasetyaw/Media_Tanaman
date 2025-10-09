import { Router } from 'express';
import path from 'path';
import fs from 'fs';

import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { convertToWebp } from '../middlewares/image.middleware.js';
import { handleUpload, validateFolder } from '../controllers/upload.controller.js';

// Logika untuk menyimpan file asli (tanpa konversi) dari memori ke disk.
// Diletakkan di sini agar tidak perlu membuat file baru.
const saveOriginalFile = async (req, res, next) => {
    if (!req.file) return next();
    const subfolder = req.uploadFolder;
    if (!subfolder) return res.status(500).json({ error: 'Upload folder not specified.' });

    try {
        const originalName = path.parse(req.file.originalname).name.replace(/\s/g, '-');
        const extension = path.extname(req.file.originalname);
        const newFilename = `${originalName}-${Date.now()}${extension}`;
        
        const outputPath = path.join('public/uploads', subfolder, newFilename);
        const outputDir = path.dirname(outputPath);

        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputPath, req.file.buffer);

        req.file.filename = newFilename;
        req.file.path = outputPath;
        
        next();
    } catch (error) {
        console.error('File saving error:', error);
        return res.status(500).json({ error: 'Failed to save file.' });
    }
};


const router = Router();

// Terapkan otentikasi untuk semua rute unggahan
router.use(authenticateToken, authorizeRoles(['ADMIN', 'JOURNALIST']));

// RUTE KHUSUS UNTUK FAVICON (TANPA KONVERSI WEBP)
// Middleware berjalan berurutan: autentikasi -> set folder -> upload -> simpan file -> handle response
router.post(
  '/favicon',
  (req, res, next) => {
    req.uploadFolder = 'settings'; 
    next();
  },
  upload.single('image'),
  saveOriginalFile,      // <-- Ini adalah perbaikan penting
  handleUpload
);


// RUTE UMUM UNTUK GAMBAR LAIN (DENGAN KONVERSI WEBP)
// Rute ini sudah benar
router.post(
  '/:folder',
  validateFolder,
  upload.single('image'),
  convertToWebp,
  handleUpload
);

export default router;