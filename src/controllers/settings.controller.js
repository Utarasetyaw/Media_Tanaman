import { PrismaClient } from '@prisma/client'; // <-- PERBAIKAN DI SINI

const prisma = new PrismaClient();
const SETTINGS_ID = 1; // ID tetap untuk baris pengaturan kita

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
        seo: true // Memastikan data SEO diambil
      },
    });

    if (!settings) {
        return res.json({});
    }

    res.json(transformImageUrls(req, settings));
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ error: 'Failed to fetch site settings.' });
  }
};

// ADMIN: Membuat atau Mengupdate data pengaturan situs
export const updateSiteSettings = async (req, res) => {
  const { bannerImages, seo, ...siteSettingsData } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update atau buat data SiteSettings utama
      await tx.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        update: siteSettingsData,
        create: {
          id: SETTINGS_ID,
          ...siteSettingsData,
        },
      });

      // 2. Update atau buat data SiteSeo yang berelasi
      if (seo) {
        await tx.siteSeo.upsert({
          where: { siteSettingsId: SETTINGS_ID },
          update: seo,
          create: {
            ...seo,
            siteSettingsId: SETTINGS_ID,
          },
        });
      }

      // 3. Hapus banner lama dan buat yang baru
      await tx.bannerImage.deleteMany({
        where: { siteSettingsId: SETTINGS_ID },
      });

      if (bannerImages && bannerImages.length > 0) {
        await tx.bannerImage.createMany({
          data: bannerImages.map((banner) => ({
            imageUrl: new URL(banner.imageUrl).pathname,
            siteSettingsId: SETTINGS_ID,
          })),
        });
      }
    });

    // 4. Ambil kembali data lengkap untuk dikirim sebagai respons
    const finalSettings = await prisma.siteSettings.findUnique({
        where: { id: SETTINGS_ID },
        include: { 
            bannerImages: {
              orderBy: { id: 'asc'}
            },
            seo: true // Memastikan data SEO juga dikirim kembali setelah update
        }
    });

    res.json(transformImageUrls(req, finalSettings));

  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(400).json({ error: 'Failed to update site settings. Please check your data format.' });
  }
};