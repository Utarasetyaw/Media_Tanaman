import { Router } from 'express';
import { getSiteSettings, updateSiteSettings } from '../controllers/settings.controller.js';
// REVISI: Gunakan nama fungsi middleware yang baru
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Rute Publik untuk mengambil data pengaturan
router.get('/', getSiteSettings);

// Rute Admin untuk mengupdate data pengaturan
// REVISI: Gunakan nama fungsi middleware yang baru
router.put('/', authenticateToken, authorizeRoles(['ADMIN']), updateSiteSettings);

export default router;