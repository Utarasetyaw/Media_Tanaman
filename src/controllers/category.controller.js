import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ADMIN: Membuat kategori baru
export const createCategory = async (req, res) => {
  const { name } = req.body; // name diharapkan berupa JSON, contoh: { "id": "Tips", "en": "Tips" }

  if (!name || !name.id || !name.en) {
    return res.status(400).json({ error: 'Category name for both languages is required.' });
  }

  try {
    const newCategory = await prisma.category.create({ data: { name } });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Could not create category.' });
  }
};

// PUBLIK & ADMIN: Mendapatkan semua kategori
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch categories.' });
  }
};

// ADMIN: Mengupdate kategori
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.id || !name.en) {
    return res.status(400).json({ error: 'Category name for both languages is required.' });
  }

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });
    res.json(updatedCategory);
  } catch (error) {
    res.status(404).json({ error: 'Category not found.' });
  }
};

// ADMIN: Menghapus kategori
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    // Error P2003 berarti kategori sedang digunakan (foreign key constraint failed)
    if (error.code === 'P2003') {
      return res.status(409).json({ error: 'Cannot delete this category because it is currently in use by articles, plants, or events.' });
    }
    res.status(404).json({ error: 'Category not found.' });
  }
};