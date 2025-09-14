// src/controllers/upload.controller.js

// REVISED: Add 'submissions' to the list of allowed upload folders
const allowedTypes = ['artikel', 'events', 'plants', 'banners', 'settings', 'submissions'];

// Middleware to validate the upload type
export const validateUploadType = (req, res, next) => {
  const { type } = req.params;
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid upload type specified.' });
  }
  next();
};

// Controller to handle the response after a successful upload
export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded.' });
  }

  // Return the relative path to be stored in the database
  // Note: The base URL (e.g., http://localhost:5000) is added by the frontend or other helpers
  const relativePath = `/uploads/${req.params.type}/${req.file.filename}`;
  res.status(201).json({ imageUrl: relativePath });
};