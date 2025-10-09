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
router.get('/my-dashboard-stats', getJournalistDashboardStats);
router.get('/my-articles', getMyArticles);
router.get('/analytics/:id', getMyArticleAnalytics);

// ▼▼▼ PERBAIKAN RUTE CREATE ARTICLE ▼▼▼
router.post(
    '/',
    upload.single('image'),
    // 1. Set nama folder tujuan di request
    (req, res, next) => {
        req.uploadFolder = 'artikel';
        next();
    },
    // 2. Panggil middleware convertToWebp secara langsung
    convertToWebp,
    createArticle
);
// ▲▲▲ AKHIR PERBAIKAN ▲▲▲


// ▼▼▼ PERBAIKAN RUTE UPDATE ARTICLE ▼▼▼
router.put(
    '/:id',
    upload.single('image'),
    // 1. Set nama folder tujuan di request
    (req, res, next) => {
        req.uploadFolder = 'artikel';
        next();
    },
    // 2. Panggil middleware convertToWebp secara langsung
    convertToWebp,
    updateArticle
);
// ▲▲▲ AKHIR PERBAIKAN ▲▲▲

router.delete('/:id', deleteMyArticle);

// --- RUTE WORKFLOW JURNALIS ---
router.post('/:id/submit', submitArticleForReview);
router.post('/:id/start-revision', startRevision);
router.post('/:id/finish-revision', finishRevision);
router.post('/:id/request-edit', requestEditAccess);
router.put('/:id/respond-edit', respondToEditRequest);


// --- RUTE KHUSUS ADMIN ---
router.use(authorizeRoles(['ADMIN']));

router.get('/all', getAllArticlesForAdmin);
router.get('/admin-dashboard-stats', getAdminDashboardStats);
router.put('/:id/status', updateArticleStatus);
router.delete('/:id/admin', deleteArticle);
router.put('/:id/cancel-request', cancelAdminEditRequest);
router.put('/:id/revert-approval', revertAdminEditApproval);

export default router;