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

// Rute untuk Banner (tetap menggunakan convertToWebp)
router.post('/banners', authenticateToken, authorizeRoles(['ADMIN']), upload.single('image'), convertToWebp('banners'), addBannerImage);
router.delete('/banners/:id', authenticateToken, authorizeRoles(['ADMIN']), deleteBannerImage);

// --- RUTE PENGUMUMAN ---
router.get('/announcements', authenticateToken, getAnnouncements);
router.put('/announcements', authenticateToken, authorizeRoles(['ADMIN']), updateAnnouncements);

export default router;