import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const convertToWebp = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    // Ambil nama folder dari request object, yang di-set oleh middleware sebelumnya.
    const subfolder = req.uploadFolder;
    
    // Tambahkan pengecekan untuk memastikan subfolder tidak undefined.
    if (!subfolder) {
        console.error('Upload folder name is missing in request.');
        return res.status(500).json({ error: 'Server configuration error: Upload folder not specified.' });
    }

    // Lewati konversi jika sudah webp
    if (req.file.mimetype === 'image/webp') {
        return next();
    }
    
    try {
        const originalName = path.parse(req.file.originalname).name.replace(/\s/g, '-');
        const newFilename = `${originalName}-${Date.now()}.webp`;
        const outputPath = path.join(__dirname, `../../public/uploads/${subfolder}`, newFilename);

        const outputDir = path.dirname(outputPath);
        // Buat direktori jika belum ada
        fs.mkdirSync(outputDir, { recursive: true });

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