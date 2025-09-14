import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
// REVISI: Gunakan nama fungsi middleware yang baru
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Rute Publik untuk mendapatkan daftar kategori
router.get('/', getAllCategories);

// Rute di bawah ini HANYA untuk ADMIN
// REVISI: Gunakan nama fungsi middleware yang baru
router.use(authenticateToken, authorizeRoles(['ADMIN']));

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;