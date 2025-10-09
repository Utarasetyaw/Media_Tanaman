import { Router } from 'express';
import { 
    getSiteSettings, updateSiteSettings, addBannerImage, deleteBannerImage, 
    getAnnouncements, updateAnnouncements 
} from '../controllers/settings.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { convertToWebp } from '../middlewares/image.middleware.js';

const router = Router();

// --- RUTE PENGATURAN SITUS ---
router.get('/', getSiteSettings);
router.put('/', authenticateToken, authorizeRoles(['ADMIN']), updateSiteSettings);

// ▼▼▼ PERBAIKAN RUTE BANNER ▼▼▼
router.post(
    '/banners', 
    authenticateToken, 
    authorizeRoles(['ADMIN']), 
    upload.single('image'), 
    // 1. Set nama folder tujuan di request
    (req, res, next) => {
        req.uploadFolder = 'banners';
        next();
    },
    // 2. Panggil middleware convertToWebp secara langsung
    convertToWebp,
    addBannerImage
);
// ▲▲▲ AKHIR PERBAIKAN ▲▲▲

router.delete('/banners/:id', authenticateToken, authorizeRoles(['ADMIN']), deleteBannerImage);

// --- RUTE PENGUMUMAN ---
router.get('/announcements', authenticateToken, getAnnouncements);
router.put('/announcements', authenticateToken, authorizeRoles(['ADMIN']), updateAnnouncements);

export default router;