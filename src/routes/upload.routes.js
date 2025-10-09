import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { convertToWebp } from '../middlewares/image.middleware.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = Router();

router.post(
  '/:type',
  authenticateToken,
  authorizeRoles(['ADMIN', 'JOURNALIST', 'USER']), 
  upload.single('image'),
  (req, res, next) => {
    const subfolder = req.params.type;
    convertToWebp(subfolder)(req, res, next);
  },
  uploadImage
);

export default router;