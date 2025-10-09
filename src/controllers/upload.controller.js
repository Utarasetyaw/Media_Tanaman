// src/controllers/upload.controller.js

const allowedFolders = ['artikel', 'events', 'plants', 'banners', 'settings', 'submissions'];

// Middleware untuk memvalidasi nama folder
export const validateFolder = (req, res, next) => {
  const { folder } = req.params;
  if (!allowedFolders.includes(folder)) {
    return res.status(400).json({ error: 'Tipe unggahan tidak valid.' });
  }
  // Teruskan nama folder ke middleware selanjutnya jika diperlukan
  req.uploadFolder = folder;
  next();
};

// Controller untuk merespons setelah unggahan berhasil
export const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
  }

  // req.file.filename sudah diperbarui oleh middleware (baik multer atau convertToWebp)
  // req.uploadFolder berasal dari middleware validateFolder atau di-set manual di rute
  const relativePath = `/uploads/${req.uploadFolder}/${req.file.filename}`;
  
  res.status(201).json({ imageUrl: relativePath });
};