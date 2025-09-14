import { Router } from 'express';
import {
  createPlantType,
  getAllPlantTypes,
  updatePlantType,
  deletePlantType
} from '../controllers/plantType.controller.js';
// REVISI: Gunakan nama fungsi middleware yang baru
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Rute Publik untuk mendapatkan semua jenis tanaman
router.get('/', getAllPlantTypes);

// Rute di bawah ini HANYA untuk ADMIN
// REVISI: Gunakan nama fungsi middleware yang baru
router.use(authenticateToken, authorizeRoles(['ADMIN']));

router.post('/', createPlantType);
router.put('/:id', updatePlantType);
router.delete('/:id', deletePlantType);

export default router;