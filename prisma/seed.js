// File: prisma/seed.js

import 'dotenv/config';
import { 
  PrismaClient, 
  Role, 
  ArticleStatus, 
  EventType, 
  AdminEditRequestStatus,
  AdType
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding...');

  // --- 1. Pembersihan Data ---
  console.log('🧹 Membersihkan data lama...');
  await prisma.eventSubmission.deleteMany();
  await prisma.articleSeo.deleteMany();
  await prisma.article.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.journalistMessage.deleteMany();
  await prisma.bannerImage.deleteMany();
  await prisma.siteSeo.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.plantType.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adContent.deleteMany();
  await prisma.adPlacement.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Data lama berhasil dibersihkan.');

  // --- 2. Pembuatan Data User ---
  console.log('👤 Membuat data user baru...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@narapati.com',
      name: 'Admin Narapati',
      password: hashedPassword,
      role: Role.ADMIN,
      phoneNumber: '+6281111111111',
      address: 'Kantor Pusat Narapati Flora, Jakarta',
      socialMedia: {
        linkedin: 'https://linkedin.com/in/adminnarapati'
      }
    },
  });

  await prisma.user.create({
    data: {
      email: 'jurnalis@narapati.com',
      name: 'Budi Santoso',
      password: hashedPassword,
      role: Role.JOURNALIST,
      phoneNumber: '+6282222222222',
    },
  });

  await prisma.user.create({
    data: {
      email: 'user@narapati.com',
      name: 'Siti Rahayu',
      password: hashedPassword,
      role: Role.USER,
    },
  });
  console.log('✅ User berhasil dibuat.');

  // --- 3. Pembuatan Data Site Settings dan SEO Umum ---
  console.log('⚙️ Membuat data Site Settings...');
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Narapati Flora',
      logoUrl: '/uploads/default-logo.png',
      faviconUrl: '/uploads/default-favicon.ico',
      businessDescription: {
        id: 'Narapati Flora adalah surga bagi para pecinta tanaman hias, menyediakan koleksi eksotis dan tips perawatan terbaik untuk menghijaukan ruang Anda.',
        en: 'Narapati Flora is a haven for ornamental plant lovers, providing exotic collections and the best care tips to green your space.',
      },
      contactInfo: {
        email: 'contact@narapatiflora.com',
        phone: '+62 812 3456 7890',
        address: 'Jl. Kebun Raya No. 123, Jakarta, Indonesia',
        socialMedia: {
          instagram: 'https://instagram.com/narapatiflora',
          facebook: 'https://facebook.com/narapatiflora',
          tiktok: 'https://tiktok.com/@narapatiflora',
        },
      },
      faqs: [
        { 
          q: { id: "Bagaimana cara merawat Monstera?", en: "How to care for a Monstera?" },
          a: { id: "Siram saat tanah kering, beri cahaya tidak langsung.", en: "Water when the soil is dry, provide indirect light." }
        },
        { 
          q: { id: "Apakah pengiriman aman?", en: "Is the shipping safe?" },
          a: { id: "Tentu, kami menggunakan kemasan khusus tanaman.", en: "Of course, we use special packaging for plants." }
        }
      ],
      companyValues: {
        id: ["Kualitas", "Integritas", "Keberlanjutan"],
        en: ["Quality", "Integrity", "Sustainability"]
      },
      bannerTagline: {
        id: 'Hijaukan Ruangmu, Segarkan Jiwamu',
        en: 'Green Your Space, Freshen Your Soul',
      },
      bannerImages: {
        create: [
          { imageUrl: '/uploads/banners/banner1.jpg' },
          { imageUrl: '/uploads/banners/banner2.jpg' },
          { imageUrl: '/uploads/banners/banner3.jpg' },
        ],
      },
      seo: {
        create: {
          metaTitle: {
            id: 'Narapati Flora - Pusat Tanaman Hias & Tips Perawatan',
            en: 'Narapati Flora - Ornamental Plants & Care Tips Center'
          },
          metaDescription: {
            id: 'Temukan koleksi tanaman hias eksotis terlengkap di Narapati Flora. Dapatkan panduan perawatan terbaik untuk kebun Anda.',
            en: 'Find the most complete collection of exotic ornamental plants at Narapati Flora. Get the best care guides for your garden.'
          },
          metaKeywords: 'tanaman hias, jual tanaman, monstera, anthurium, perawatan tanaman',
          ogDefaultImageUrl: '/uploads/default-social-image.jpg',
          twitterSite: '@narapatiflora',
        }
      }
    },
  });
  console.log('✅ Site Settings dan SEO Umum berhasil dibuat.');

  // --- 4. Pembuatan Data Kategori ---
  console.log('🏷️ Membuat data kategori...');
  const categories = await prisma.category.createManyAndReturn({
    data: [
      { name: { id: 'Penyakit Tanaman', en: 'Plant Diseases' } },
      { name: { id: 'Perawatan Tanaman', en: 'Plant Care' } },
      { name: { id: 'Budidaya', en: 'Cultivation' } },
      { name: { id: 'Tanaman Langka', en: 'Rare Plants' } },
      { name: { id: 'Tips Dekorasi', en: 'Decoration Tips' } },
    ],
  });
  console.log('✅ Kategori berhasil dibuat.');

  // --- 5. Pembuatan Data Tipe Tanaman ---
  console.log('🌿 Membuat data tipe tanaman...');
  const plantTypes = await prisma.plantType.createManyAndReturn({
    data: [
      { name: { id: 'Anthurium', en: 'Anthurium' } },
      { name: { id: 'Platycerium', en: 'Platycerium' } },
      { name: { id: 'Alocasia', en: 'Alocasia' } },
      { name: { id: 'Monstera', en: 'Monstera' } },
      { name: { id: 'Philodendron', en: 'Philodendron' } },
    ],
  });
  console.log('✅ Tipe tanaman berhasil dibuat.');
  
  // --- 6. Pembuatan Pesan untuk Jurnalis ---
  console.log('✍️ Membuat pesan untuk jurnalis...');
  await prisma.journalistMessage.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: {
        id: 'Panduan dan Peraturan Penulisan Artikel',
        en: 'Article Writing Guidelines and Rules',
      },
      content: {
        id: 'Selamat datang di dasbor jurnalis! Pastikan setiap artikel memiliki sumber yang valid, gambar berkualitas tinggi, dan mengikuti standar SEO yang telah ditentukan. Artikel harus orisinal dan informatif.',
        en: 'Welcome to the journalist dashboard! Ensure every article has valid sources, high-quality images, and follows the specified SEO standards. Articles must be original and informative.',
      },
    },
  });
  console.log('✅ Pesan jurnalis berhasil dibuat.');

  // --- 7. Pembuatan 20 Data Plant ---
  console.log('🪴 Membuat 20 data plant...');
  const plantsToCreate = [];
  for (let i = 0; i < 20; i++) {
    const randomPlantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
    plantsToCreate.push({
      name: { id: `${randomPlantType.name.id} Unik #${i + 1}`, en: `Unique ${randomPlantType.name.en} #${i + 1}` },
      scientificName: `${randomPlantType.name.en} species #${i + 1}`,
      description: { id: `Deskripsi detail untuk ${randomPlantType.name.id} unik, termasuk cara perawatan dan keunikannya.`, en: `Detailed description for the unique ${randomPlantType.name.en}, including care instructions and its unique features.` },
      imageUrl: `/uploads/plants/plant-image-${i + 1}.jpg`,
      stores: { online: 'Tokopedia, Shopee', offline: 'Toko Kebun Lokal, Pameran Flora' },
      plantTypeId: randomPlantType.id,
    });
  }
  await prisma.plant.createMany({ data: plantsToCreate });
  console.log(`✅ ${plantsToCreate.length} plant berhasil dibuat.`);

  // --- 8. Pembuatan 15 Data Event ---
  console.log('🗓️ Membuat 15 data event...');
  const eventsToCreate = [];
  const eventTypes = [EventType.INTERNAL, EventType.EXTERNAL];
  const locations = ['Jakarta Convention Center', 'Online via Zoom', 'Kebun Raya Bogor', 'Grand Indonesia'];
  for (let i = 0; i < 15; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60) - 30); // Rentang -30 hingga +30 hari dari sekarang
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3) + 1); // Durasi 1-3 hari
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    eventsToCreate.push({
      title: { id: `Pameran ${randomCategory.name.id} #${i + 1}`, en: `${randomCategory.name.en} Exhibition #${i + 1}` },
      description: { id: `Deskripsi untuk acara pameran ${randomCategory.name.id}. Jangan lewatkan!`, en: `Description for the ${randomCategory.name.en} exhibition event. Do not miss it!` },
      imageUrl: `/uploads/events/event-image-${i + 1}.jpg`,
      location: locations[Math.floor(Math.random() * locations.length)],
      organizer: 'Narapati Organizer',
      startDate,
      endDate,
      eventType: type,
      externalUrl: type === EventType.EXTERNAL ? `https://example-event.com/ticket/${i + 1}` : null,
    });
  }
  await prisma.event.createMany({ data: eventsToCreate });
  console.log(`✅ ${eventsToCreate.length} event berhasil dibuat.`);

  // --- 9. Pembuatan 50 Data Artikel oleh Admin ---
  console.log('📰 Membuat 50 data artikel...');
  const statuses = [ArticleStatus.PUBLISHED, ArticleStatus.DRAFT, ArticleStatus.IN_REVIEW, ArticleStatus.NEEDS_REVISION];
  const articleCreationPromises = [];

  for (let i = 1; i <= 50; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomPlantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
    const articleTitle = { id: `Panduan Lengkap Merawat ${randomPlantType.name.id} untuk Pemula #${i}`, en: `Complete Guide to Caring for ${randomPlantType.name.en} for Beginners #${i}` };
    const articleExcerpt = { id: `Pelajari cara merawat ${randomPlantType.name.id} agar tumbuh subur.`, en: `Learn how to care for ${randomPlantType.name.en} to make it thrive.` };

    const promise = prisma.article.create({
      data: {
        title: articleTitle,
        excerpt: articleExcerpt,
        content: { id: `Ini adalah konten lengkap yang membahas semua aspek perawatan ${randomPlantType.name.id}, mulai dari penyiraman, pemupukan, hingga penanganan hama.`, en: `This is the full content discussing all aspects of ${randomPlantType.name.en} care, from watering, fertilizing, to pest control.` },
        imageUrl: `/uploads/articles/article-image-${i}.jpg`,
        authorId: admin.id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        adminEditRequest: AdminEditRequestStatus.NONE,
        categoryId: randomCategory.id,
        plantTypeId: randomPlantType.id,
        viewCount: Math.floor(Math.random() * 10000),
        likeCount: Math.floor(Math.random() * 2500),
        seo: {
          create: {
            metaTitle: articleTitle,
            metaDescription: articleExcerpt,
            keywords: `${randomPlantType.name.id}, ${randomCategory.name.id}, perawatan tanaman, tips`,
            ogTitle: articleTitle,
            ogDescription: articleExcerpt,
            ogImageUrl: `/uploads/articles/social-article-${i}.jpg`,
          }
        }
      }
    });
    articleCreationPromises.push(promise);
  }

  await Promise.all(articleCreationPromises);
  console.log(`✅ 50 artikel berhasil dibuat.`);
  
  // --- 10. Pembuatan Data Iklan ---
  console.log('📢 Membuat data iklan...');
  const sidebarAd = await prisma.adPlacement.create({
    data: {
      name: 'Sidebar Vertikal',
      type: AdType.VERTICAL,
      isActive: true,
      ads: {
        create: [
          {
            imageUrl: '/uploads/ads/sidebar-promo-1.gif',
            linkUrl: 'https://example.com/promo1',
            isActive: true,
          },
          {
            imageUrl: '/uploads/ads/sidebar-promo-2.jpg',
            linkUrl: 'https://example.com/promo2',
            isActive: true,
          },
        ]
      }
    }
  });

  const headerAd = await prisma.adPlacement.create({
    data: {
      name: 'Header Horizontal',
      type: AdType.HORIZONTAL,
      isActive: true,
      ads: {
        create: {
          imageUrl: '/uploads/ads/header-banner-new-product.png',
          linkUrl: 'https://example.com/new-product',
          isActive: true,
        },
      }
    }
  });
  console.log(`✅ 2 penempatan iklan dengan kontennya berhasil dibuat.`);
}

main()
  .catch((e) => {
    console.error('❌ Terjadi error saat proses seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🏁 Proses seeding selesai.');
  });