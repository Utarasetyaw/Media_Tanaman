import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SETTINGS_ID = 1; // ID tetap untuk baris pengaturan kita

// PUBLIK: Mengambil data pengaturan situs
export const getSiteSettings = async (req, res) => {
  try {
    // --- REVISI: Tambahkan `include` untuk mengambil data bannerImages ---
    const settings = await prisma.siteSettings.findUnique({
      where: { id: SETTINGS_ID },
      include: {
        bannerImages: { // Ambil semua gambar banner yang terhubung
          orderBy: { id: 'asc' }
        },
      },
    });

    if (!settings) {
        // Jika belum ada pengaturan, kirim objek kosong
        return res.json({});
    }

    res.json(settings);
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ error: 'Failed to fetch site settings.' });
  }
};

// ADMIN: Membuat atau Mengupdate data pengaturan situs
export const updateSiteSettings = async (req, res) => {
  // --- REVISI: Logika diubah total untuk menangani relasi banner ---
  const { bannerImages, ...siteSettingsData } = req.body;

  try {
    // Kita gunakan transaksi untuk memastikan semua operasi berhasil atau gagal bersamaan
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update atau buat data utama SiteSettings (tanpa banner)
      const updatedSettings = await tx.siteSettings.upsert({
        where: { id: SETTINGS_ID },
        update: siteSettingsData,
        create: {
          id: SETTINGS_ID,
          ...siteSettingsData,
        },
      });

      // 2. Sinkronkan Banner: Hapus semua banner lama
      await tx.bannerImage.deleteMany({
        where: { siteSettingsId: SETTINGS_ID },
      });

      // 3. Buat ulang semua banner berdasarkan data baru dari frontend
      if (bannerImages && bannerImages.length > 0) {
        await tx.bannerImage.createMany({
          data: bannerImages.map((banner) => ({
            imageUrl: banner.imageUrl,
            siteSettingsId: SETTINGS_ID,
          })),
        });
      }

      return updatedSettings;
    });

    // 4. Ambil kembali data lengkap dengan banner yang sudah disinkronkan untuk dikirim sebagai respons
    const finalSettings = await prisma.siteSettings.findUnique({
        where: { id: SETTINGS_ID },
        include: { bannerImages: true }
    });

    res.json(finalSettings);

  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(400).json({ error: 'Failed to update site settings. Please check your data format.' });
  }
};