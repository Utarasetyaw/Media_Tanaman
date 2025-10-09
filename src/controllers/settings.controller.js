import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const SETTINGS_ID = 1;
const ANNOUNCEMENT_ID = 1;

// --- FUNGSI UNTUK PENGATURAN SITUS (SITE SETTINGS) ---

const transformImageUrls = (req, data) => {
    if (!data) return data;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const transformItem = (item) => {
        if (!item) return item;
        const newItem = { ...item };
        const keysToTransform = ['imageUrl', 'logoUrl', 'faviconUrl'];
        keysToTransform.forEach(key => {
            if (newItem[key] && String(newItem[key]).startsWith('/')) {
                newItem[key] = `${baseUrl}${newItem[key]}`;
            }
        });
        if (newItem.bannerImages && Array.isArray(newItem.bannerImages)) {
            newItem.bannerImages = newItem.bannerImages.map(transformItem);
        }
        return newItem;
    };
    return Array.isArray(data) ? data.map(transformItem) : transformItem(data);
};

// Helper function untuk menghapus file lama dengan aman
const deleteOldFile = (filePath) => {
    if (!filePath) return;
    // 1. Hapus garis miring di awal jika ada untuk path joining yang benar
    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(__dirname, '../../public', relativePath);

    // 2. Cek apakah file ada dan bukan URL eksternal sebelum menghapus
    if (fs.existsSync(fullPath) && !filePath.startsWith('http')) {
        try {
            fs.unlinkSync(fullPath);
            console.log(`Successfully deleted old file: ${fullPath}`);
        } catch (err) {
            // 3. Tangani error jika penghapusan gagal, tapi jangan hentikan proses
            console.error(`Failed to delete old file: ${fullPath}`, err);
        }
    }
};


export const getSiteSettings = async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
      include: {
        bannerImages: {
          orderBy: { id: 'asc' }
        },
        seo: true 
      },
    });

    if (!settings) {
        const initialSettings = await prisma.siteSettings.create({ data: { id: SETTINGS_ID, name: 'My Site' } });
        return res.json(transformImageUrls(req, initialSettings));
    }

    res.json(transformImageUrls(req, settings));
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ error: 'Failed to fetch site settings.' });
  }
};

export const updateSiteSettings = async (req, res) => {
  const { bannerImages, seo, ...siteSettingsData } = req.body;

  try {
    const currentSettings = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
    });

    if (currentSettings) {
      // Cek dan hapus logo lama jika diubah
      if (siteSettingsData.logoUrl && siteSettingsData.logoUrl !== currentSettings.logoUrl) {
          deleteOldFile(currentSettings.logoUrl);
      }
      
      // Cek dan hapus favicon lama jika diubah
      if (siteSettingsData.faviconUrl && siteSettingsData.faviconUrl !== currentSettings.faviconUrl) {
          deleteOldFile(currentSettings.faviconUrl);
      }
    }

    // Lanjutkan dengan transaksi database
    await prisma.$transaction(async (tx) => {
      await tx.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        update: siteSettingsData,
        create: { id: SETTINGS_ID, ...siteSettingsData },
      });

      if (seo) {
        await tx.siteSeo.upsert({
          where: { siteSettingsId: SETTINGS_ID },
          update: seo,
          create: { ...seo, siteSettingsId: SETTINGS_ID },
        });
      }
    });

    const finalSettings = await prisma.siteSettings.findUnique({
        where: { id: SETTINGS_ID },
        include: { bannerImages: { orderBy: { id: 'asc'} }, seo: true }
    });

    res.json(transformImageUrls(req, finalSettings));

  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(400).json({ error: 'Failed to update site settings. Please check your data format.' });
  }
};

export const addBannerImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    try {
        await prisma.bannerImage.create({
            data: {
                imageUrl: `/uploads/banners/${req.file.filename}`,
                siteSettingsId: SETTINGS_ID,
            }
        });

        const finalSettings = await prisma.siteSettings.findUnique({
            where: { id: SETTINGS_ID },
            include: { bannerImages: { orderBy: { id: 'asc' } }, seo: true }
        });

        res.status(201).json(transformImageUrls(req, finalSettings));

    } catch (error) {
        console.error("Add Banner Error:", error);
        res.status(500).json({ error: 'Failed to add banner image.' });
    }
};

export const deleteBannerImage = async (req, res) => {
    const { id } = req.params;
    const bannerId = parseInt(id, 10);

    if (isNaN(bannerId)) {
        return res.status(400).json({ error: 'Invalid banner ID.' });
    }

    try {
        const bannerToDelete = await prisma.bannerImage.findUnique({
            where: { id: bannerId },
        });

        if (!bannerToDelete) {
            return res.status(404).json({ error: 'Banner not found.' });
        }
        
        // Gunakan helper function yang sudah ada
        deleteOldFile(bannerToDelete.imageUrl);

        await prisma.bannerImage.delete({
            where: { id: bannerId },
        });

        res.status(200).json({ message: 'Banner deleted successfully.' });

    } catch (error) {
        console.error("Delete Banner Error:", error);
        res.status(500).json({ error: 'Failed to delete banner image.' });
    }
};

// --- FUNGSI BARU UNTUK PENGUMUMAN (ANNOUNCEMENTS) ---

export const getAnnouncements = async (req, res) => {
    try {
        let announcements = await prisma.announcement.findUnique({
            where: { id: ANNOUNCEMENT_ID },
        });

        if (!announcements) {
            announcements = await prisma.announcement.create({
                data: {
                    id: ANNOUNCEMENT_ID,
                    journalistAnnouncement: { id: '', en: '' },
                    userAnnouncement: { id: '', en: '' },
                    journalistRules: { id: '', en: '' },
                    userRules: { id: '', en: '' },
                }
            });
        }
        res.json(announcements);
    } catch (error) {
        console.error("Get Announcements Error:", error);
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};

export const updateAnnouncements = async (req, res) => {
    const dataToUpdate = req.body;
    try {
        const updatedAnnouncements = await prisma.announcement.upsert({
            where: { id: ANNOUNCEMENT_ID },
            update: dataToUpdate,
            create: { id: ANNOUNCEMENT_ID, ...dataToUpdate },
        });
        res.json(updatedAnnouncements);
    } catch (error) {
        console.error("Update Announcements Error:", error);
        res.status(400).json({ error: 'Failed to update announcements.' });
    }
};