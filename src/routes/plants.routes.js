import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware.js';

import {
  createPlant,
  updatePlant,
  deletePlant,
  getManagementPlants,
  getPlantByIdForAdmin
} from '../controllers/plants.controller.js';

const router = Router();

// Middleware ini akan melindungi semua rute yang didefinisikan setelahnya
router.use(authenticateToken, authorizeRoles(['ADMIN']));

// REVISI: Definisikan rute secara eksplisit untuk menghindari ambiguitas

// Rute untuk daftar (GET) dan membuat (POST)
router.get('/', getManagementPlants);
router.post('/', createPlant);

// Rute untuk detail (GET), update (PUT), dan hapus (DELETE) berdasarkan ID
router.get('/:id', getPlantByIdForAdmin);
router.put('/:id', updatePlant);
router.delete('/:id', deletePlant);

export default router;