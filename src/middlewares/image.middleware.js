import sharp from 'sharp';
import path from 'path';
import fs from 'fs'; // <-- 1. Import modul 'fs'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const convertToWebp = (subfolder) => async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    // Lewati konversi jika sudah webp (opsional, bisa dihapus jika ingin re-compress)
    if (req.file.mimetype === 'image/webp') {
        return next();
    }
    
    try {
        // Ganti spasi di nama file untuk keamanan URL
        const originalName = path.parse(req.file.originalname).name.replace(/\s/g, '-');
        const newFilename = `${originalName}-${Date.now()}.webp`;
        const outputPath = path.join(__dirname, `../../public/uploads/${subfolder}`, newFilename);

        // ▼▼▼ PERBAIKAN DI SINI ▼▼▼
        // Dapatkan path direktorinya dan buat jika belum ada
        const outputDir = path.dirname(outputPath);
        fs.mkdirSync(outputDir, { recursive: true });
        // ▲▲▲ AKHIR PERBAIKAN ▲▲▲

        await sharp(req.file.buffer)
            .webp({ quality: 80 }) 
            .toFile(outputPath);

        // Perbarui informasi file di `req` untuk controller selanjutnya
        req.file.filename = newFilename;
        req.file.path = outputPath;
        req.file.mimetype = 'image/webp';
        
        next();

    } catch (error) {
        console.error('Image conversion error:', error);
        return res.status(500).json({ error: 'Failed to process image.' });
    }
};