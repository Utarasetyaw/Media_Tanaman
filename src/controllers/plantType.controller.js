import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ADMIN: Membuat Tipe Tanaman baru
export const createPlantType = async (req, res) => {
  const { name } = req.body; // name diharapkan berupa JSON

  if (!name || !name.id || !name.en) {
    return res.status(400).json({ error: 'Plant type name for both languages is required.' });
  }

  try {
    const newPlantType = await prisma.plantType.create({ data: { name } });
    res.status(201).json(newPlantType);
  } catch (error) {
    res.status(500).json({ error: 'Could not create plant type.' });
  }
};

// PUBLIK & ADMIN: Mendapatkan semua Tipe Tanaman
export const getAllPlantTypes = async (req, res) => {
  try {
    const plantTypes = await prisma.plantType.findMany({ orderBy: { id: 'asc' } });
    res.json(plantTypes);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch plant types.' });
  }
};

// ADMIN: Mengupdate Tipe Tanaman
export const updatePlantType = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.id || !name.en) {
    return res.status(400).json({ error: 'Plant type name for both languages is required.' });
  }

  try {
    const updatedPlantType = await prisma.plantType.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(updatedPlantType);
  } catch (error) {
    res.status(404).json({ error: 'Plant type not found.' });
  }
};

// ADMIN: Menghapus Tipe Tanaman
export const deletePlantType = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.plantType.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2003') {
      return res.status(409).json({ error: 'Cannot delete this plant type because it is currently in use.' });
    }
    res.status(404).json({ error: 'Plant type not found.' });
  }
};