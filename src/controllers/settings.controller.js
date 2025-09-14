import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SETTINGS_ID = 1; // ID tetap untuk baris pengaturan kita

// REVISI: Tambahkan helper untuk transformasi URL gambar
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


// PUBLIK: Mengambil data pengaturan situs
export const getSiteSettings = async (req, res) => {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
      include: {
        bannerImages: {
          orderBy: { id: 'asc' }
        },
      },
    });

    if (!settings) {
        return res.json({});
    }

    // REVISI: Transformasikan URL sebelum mengirim respons
    res.json(transformImageUrls(req, settings));
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ error: 'Failed to fetch site settings.' });
  }
};

// ADMIN: Membuat atau Mengupdate data pengaturan situs
export const updateSiteSettings = async (req, res) => {
  const { bannerImages, ...siteSettingsData } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updatedSettings = await tx.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        update: siteSettingsData,
        create: {
          id: SETTINGS_ID,
          ...siteSettingsData,
        },
      });

      await tx.bannerImage.deleteMany({
        where: { siteSettingsId: SETTINGS_ID },
      });

      if (bannerImages && bannerImages.length > 0) {
        await tx.bannerImage.createMany({
          data: bannerImages.map((banner) => ({
            // Pastikan hanya path yang disimpan di database
            imageUrl: new URL(banner.imageUrl).pathname,
            siteSettingsId: SETTINGS_ID,
          })),
        });
      }

      return updatedSettings;
    });

    const finalSettings = await prisma.siteSettings.findUnique({
        where: { id: SETTINGS_ID },
        include: { bannerImages: true }
    });

    // REVISI: Transformasikan URL sebelum mengirim respons
    res.json(transformImageUrls(req, finalSettings));

  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(400).json({ error: 'Failed to update site settings. Please check your data format.' });
  }
};
