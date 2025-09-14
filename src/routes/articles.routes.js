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

const router = Router();

// =================================================================
// SEMUA RUTE DI BAWAH INI MEMBUTUHKAN AUTENTIKASI
// =================================================================
router.use(authenticateToken);

// =================================================================
// RUTE UNTUK JURNALIS & ADMIN (Aksi Umum)
// =================================================================
router.get('/my-dashboard-stats', getJournalistDashboardStats);
router.get('/admin-dashboard-stats', authorizeRoles(['ADMIN']), getAdminDashboardStats);
router.get('/my-articles', getMyArticles);
router.get('/analytics/:id', getMyArticleAnalytics);
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteMyArticle);

// =================================================================
// RUTE ALUR KERJA (WORKFLOW) JURNALIS
// =================================================================
router.post('/:id/submit', submitArticleForReview);
router.post('/:id/start-revision', startRevision);
router.post('/:id/finish-revision', finishRevision);
router.post('/:id/request-edit', requestEditAccess);
router.put('/:id/respond-edit', respondToEditRequest);

// =================================================================
// RUTE KHUSUS ADMIN (Manajemen Penuh)
// =================================================================

// Sub-router untuk semua endpoint admin
const adminRouter = Router();
adminRouter.use(authorizeRoles(['ADMIN']));

// Admin melihat semua artikel dari semua penulis
adminRouter.get('/all', getAllArticlesForAdmin);

// Admin mengubah status artikel (Publish, Reject, dll)
adminRouter.put('/:id/status', updateArticleStatus);

// Admin menghapus artikel milik siapa pun
adminRouter.delete('/:id', deleteArticle);

// Admin membatalkan permintaan edit dari jurnalis
adminRouter.put('/:id/cancel-request', cancelAdminEditRequest);

// Admin mengembalikan izin edit yang sudah disetujui
adminRouter.put('/:id/revert-approval', revertAdminEditApproval);

// REVISI: Gunakan sub-router admin tanpa prefix tambahan
// Karena prefix '/management' sudah diatur di server.js
router.use(adminRouter);


export default router;