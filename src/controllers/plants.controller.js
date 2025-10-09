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
      orderBy: { 'name': 'asc' },
      include: {
        plantType: true,
        stores: true, // Sertakan data toko
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
  const { name, scientificName, description, stores, plantTypeId } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'File gambar wajib diunggah.' });
  }
  const imageUrl = `/uploads/plants/${req.file.filename}`;

  if (!name || !plantTypeId) {
    return res.status(400).json({ error: 'Nama dan Tipe Tanaman wajib diisi.' });
  }

  try {
    const storesData = stores ? JSON.parse(stores) : [];

    const plant = await prisma.plant.create({
      data: {
        name: JSON.parse(name),
        scientificName,
        description: description ? JSON.parse(description) : { id: '', en: '' },
        imageUrl,
        plantTypeId: parseInt(plantTypeId),
        stores: {
          create: storesData.map(store => ({ name: store.name, url: store.url })),
        },
      },
      include: { stores: true },
    });
    res.status(201).json(transformPlantImage(req, plant));
  } catch (error) {
    console.error("Create Plant Error:", error);
    res.status(400).json({ error: 'Failed to create plant. Please check data format.' });
  }
};

/**
 * ADMIN: Memperbarui data tanaman.
 */
export const updatePlant = async (req, res) => {
  const { id } = req.params;
  const plantId = parseInt(id);
  if (isNaN(plantId)) return res.status(400).json({ error: 'Invalid Plant ID.' });

  const { name, scientificName, description, stores, plantTypeId } = req.body;
  const dataToUpdate = {};

  if (name) dataToUpdate.name = JSON.parse(name);
  if (scientificName) dataToUpdate.scientificName = scientificName;
  if (description) dataToUpdate.description = JSON.parse(description);
  if (plantTypeId) dataToUpdate.plantTypeId = parseInt(plantTypeId);
  if (req.file) dataToUpdate.imageUrl = `/uploads/plants/${req.file.filename}`;

  try {
    if (req.file) {
        const oldPlant = await prisma.plant.findUnique({ where: { id: plantId } });
        if (oldPlant?.imageUrl && !oldPlant.imageUrl.startsWith('http')) {
            const oldImagePath = path.join(__dirname, '../../public', oldPlant.imageUrl);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }
    }

    const storesData = stores ? JSON.parse(stores) : [];

    const updatedPlant = await prisma.$transaction(async (tx) => {
      await tx.store.deleteMany({ where: { plantId: plantId } });

      return tx.plant.update({
        where: { id: plantId },
        data: {
          ...dataToUpdate,
          stores: {
            create: storesData.map(store => ({ name: store.name, url: store.url })),
          },
        },
        include: { stores: true },
      });
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
        const imagePath = path.join(__dirname, '../../public', plant.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }
    await prisma.plant.delete({ where: { id: plantId } });
    res.status(204).send();
  } catch (error) {
    console.error("Delete Plant Error:", error);
    res.status(404).json({ error: 'Plant not found.' });
  }
};

/**
 * ADMIN: Mengambil detail satu tanaman.
 */
export const getPlantByIdForAdmin = async (req, res) => {
  const { id } = req.params;
  const plantId = parseInt(id);
  if (isNaN(plantId)) return res.status(400).json({ error: 'Invalid Plant ID.' });

  try {
    const plant = await prisma.plant.findUnique({
      where: { id: plantId },
      include: {
        plantType: true,
        stores: true, // Sertakan data toko
      }
    });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    res.json(transformPlantImage(req, plant));
  } catch (error) {
    console.error("Get Plant By ID for Admin Error:", error);
    res.status(500).json({ error: 'Failed to fetch plant details.' });
  }
};

// =================================================================
// RUTE PUBLIK & PELACAKAN
// =================================================================

/**
 * PUBLIK: Melacak klik toko dan me-redirect.
 */
export const trackStoreClick = async (req, res) => {
    const { id } = req.params;
    const storeId = parseInt(id);

    if (isNaN(storeId)) {
        return res.status(400).json({ error: 'Invalid store ID.' });
    }

    try {
        const store = await prisma.store.update({
            where: { id: storeId },
            data: { clicks: { increment: 1 } },
        });
        
        res.redirect(store.url);
    } catch (error) {
        console.error("Track click error:", error);
        res.redirect('/'); 
    }
};