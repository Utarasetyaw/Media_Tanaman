import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- HELPER UNTUK TRANSFORMASI URL GAMBAR ---
const transformPlantImage = (req, plant) => {
  if (plant?.imageUrl && plant.imageUrl.startsWith('/')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { ...plant, imageUrl: `${baseUrl}${plant.imageUrl}` };
  }
  return plant;
};

// =================================================================
// RUTE-RUTE MANAJEMEN ADMIN
// =================================================================

/**
 * ADMIN: Mengambil semua tanaman untuk halaman manajemen.
 */
export const getManagementPlants = async (req, res) => {
  try {
    const plants = await prisma.plant.findMany({
      orderBy: { name: 'asc' },
      include: {
        category: true,
        family: true,
      }
    });
    const transformedPlants = plants.map(plant => transformPlantImage(req, plant));
    res.json(transformedPlants);
  } catch (error) {
    console.error("Get Management Plants Error:", error);
    res.status(500).json({ error: 'Failed to fetch plants for management.' });
  }
};

/**
 * ADMIN: Membuat tanaman baru.
 */
export const createPlant = async (req, res) => {
  const { name, scientificName, description, imageUrl, categoryId, familyId, careLevel, size, stores } = req.body;
  if (!name || !scientificName || !description || !imageUrl || !categoryId || !familyId || !careLevel || !size || !stores) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }
  try {
    const plant = await prisma.plant.create({
      data: {
        name, scientificName, description, imageUrl, careLevel, size, stores,
        categoryId: parseInt(categoryId),
        familyId: parseInt(familyId),
      },
    });
    res.status(201).json(transformPlantImage(req, plant));
  } catch (error) {
    console.error("Create Plant Error:", error);
    res.status(400).json({ error: 'Failed to create plant. Please check your data format.' });
  }
};

/**
 * ADMIN: Memperbarui data tanaman.
 */
export const updatePlant = async (req, res) => {
  const { id } = req.params;
  const plantId = parseInt(id);
  if (isNaN(plantId)) return res.status(400).json({ error: 'Invalid Plant ID.' });

  const dataToUpdate = req.body;
  if (dataToUpdate.categoryId) dataToUpdate.categoryId = parseInt(dataToUpdate.categoryId);
  if (dataToUpdate.familyId) dataToUpdate.familyId = parseInt(dataToUpdate.familyId);

  try {
    if (dataToUpdate.imageUrl) {
        const oldPlant = await prisma.plant.findUnique({ where: { id: plantId } });
        if (oldPlant?.imageUrl && oldPlant.imageUrl !== dataToUpdate.imageUrl && !oldPlant.imageUrl.startsWith('http')) {
            const oldImageName = oldPlant.imageUrl.split('/').pop();
            const oldImagePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'plants', oldImageName);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
    }
    const updatedPlant = await prisma.plant.update({
      where: { id: plantId },
      data: dataToUpdate,
    });
    res.json(transformPlantImage(req, updatedPlant));
  } catch (error) {
    console.error("Update Plant Error:", error);
    res.status(404).json({ error: 'Plant not found or update failed.' });
  }
};

/**
 * ADMIN: Menghapus tanaman.
 */
export const deletePlant = async (req, res) => {
  const { id } = req.params;
  const plantId = parseInt(id);
  if (isNaN(plantId)) return res.status(400).json({ error: 'Invalid Plant ID.' });

  try {
    const plant = await prisma.plant.findUnique({ where: { id: plantId } });
    if (plant?.imageUrl && !plant.imageUrl.startsWith('http')) {
        const imageName = plant.imageUrl.split('/').pop();
        const imagePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'plants', imageName);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await prisma.plant.delete({ where: { id: plantId } });
    res.status(204).send();
  } catch (error) {
    console.error("Delete Plant Error:", error);
    res.status(404).json({ error: 'Plant not found.' });
  }
};

export const getPlantByIdForAdmin = async (req, res) => {
  const { id } = req.params;
  const plantId = parseInt(id);

  if (isNaN(plantId)) {
    return res.status(400).json({ error: 'Invalid Plant ID.' });
  }

  try {
    const plant = await prisma.plant.findUnique({
      where: { id: plantId },
      include: {
        category: true,
        family: true,
      }
    });

    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    res.json(transformPlantImage(req, plant));
  } catch (error) {
    console.error("Get Plant By ID for Admin Error:", error);
    res.status(500).json({ error: 'Failed to fetch plant details.' });
  }
};