import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  createArticle,
  updateArticle,
  deleteMyArticle,
  submitArticleForReview,
  startRevision,
  finishRevision,
  getMyArticles,
  getMyArticleAnalytics,
  requestEditAccess,
  respondToEditRequest,
  getJournalistDashboardStats,
  getAdminDashboardStats,
  getAllArticlesForAdmin,
  updateArticleStatus,
  deleteArticle,
  cancelAdminEditRequest,
  revertAdminEditApproval
} from '../controllers/articles.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import { convertToWebp } from '../middlewares/image.middleware.js';

const router = Router();

// Middleware ini akan melindungi semua rute yang didefinisikan setelahnya
router.use(authenticateToken);

// --- RUTE UNTUK JURNALIS (Akses Pribadi) ---
// contoh: GET /api/articles/management/my-articles
router.get('/my-dashboard-stats', getJournalistDashboardStats);
router.get('/my-articles', getMyArticles);
router.get('/analytics/:id', getMyArticleAnalytics);
router.post(
    '/',
    upload.single('image'),
    convertToWebp('artikel'),
    createArticle
);
router.put(
    '/:id',
    upload.single('image'),
    convertToWebp('artikel'),
    updateArticle
);
router.delete('/:id', deleteMyArticle);

// --- RUTE WORKFLOW JURNALIS ---
router.post('/:id/submit', submitArticleForReview);
router.post('/:id/start-revision', startRevision);
router.post('/:id/finish-revision', finishRevision);
router.post('/:id/request-edit', requestEditAccess);
router.put('/:id/respond-edit', respondToEditRequest);


// --- RUTE KHUSUS ADMIN ---
// Rute di bawah ini memerlukan otorisasi sebagai ADMIN
router.use(authorizeRoles(['ADMIN']));

// GET /api/articles/management/all
router.get('/all', getAllArticlesForAdmin);

// GET /api/articles/management/admin-dashboard-stats
router.get('/admin-dashboard-stats', getAdminDashboardStats);

// PUT /api/articles/management/:id/status
router.put('/:id/status', updateArticleStatus);

// DELETE /api/articles/management/:id (versi admin)
router.delete('/:id/admin', deleteArticle);

// PUT /api/articles/management/:id/cancel-request
router.put('/:id/cancel-request', cancelAdminEditRequest);

// PUT /api/articles/management/:id/revert-approval
router.put('/:id/revert-approval', revertAdminEditApproval);

export default router;