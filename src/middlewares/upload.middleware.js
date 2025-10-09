import multer from 'multer';

const fileFilter = (req, file, cb) => {
  // Filter tetap sama, hanya menerima file gambar
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Middleware multer sekarang dikonfigurasi untuk menyimpan file di memori
const upload = multer({ 
  storage: multer.memoryStorage(), // Kunci perubahan: simpan file di RAM sebagai buffer
  fileFilter: fileFilter, 
  limits: { fileSize: 10 * 1024 * 1024 } // Batas ukuran file 10MB
});

// Ekspor instance multer yang sudah siap pakai
export { upload };