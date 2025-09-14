import { Router } from 'express';
import { getAdminDashboardData, getJournalistDashboardData } from '../controllers/dashboard.controller.js';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Semua rute di sini memerlukan autentikasi
router.use(authenticateToken);

// Rute untuk dashboard admin, hanya bisa diakses oleh ADMIN
router.get('/admin', authorizeRoles(['ADMIN']), getAdminDashboardData);

// Rute untuk dashboard jurnalis, bisa diakses oleh JURNALIS dan ADMIN
router.get('/journalist', authorizeRoles(['ADMIN', 'JOURNALIS']), getJournalistDashboardData);

export default router;