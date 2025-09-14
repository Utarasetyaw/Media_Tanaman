// src/middlewares/upload.middleware.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Fungsi ini akan membuat middleware multer yang bisa dikonfigurasi
export const createUploader = (subfolder) => {
  const uploadDir = path.join(__dirname, `../../public/uploads/${subfolder}`);
  
  // Memastikan direktori tujuan ada
  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  return multer({ 
    storage: storage, 
    fileFilter: fileFilter, 
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });
};