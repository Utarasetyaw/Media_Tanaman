import 'dotenv/config';
import { PrismaClient, Role, ArticleStatus, CareLevel, PlantSize, EventType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  // --- 1. Pembersihan Data ---
  console.log('Membersihkan data lama...');
  await prisma.article.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.plantType.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('Data lama berhasil dibersihkan.');

  // --- 2. Pembuatan Data User ---
  console.log('Membuat data user baru...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@narapati.com',
      name: 'Admin Narapati',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // User lain tetap dibuat untuk kelengkapan data
  await prisma.user.create({
    data: {
      email: 'jurnalis@narapati.com',
      name: 'Budi Santoso',
      password: hashedPassword,
      role: Role.JOURNALIST,
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
  console.log('User berhasil dibuat.');

  // --- 3. Pembuatan Data Kategori ---
  console.log('Membuat data kategori...');
  const categories = await prisma.category.createManyAndReturn({
    data: [
      { name: { id: 'Penyakit Tanaman', en: 'Plant Diseases' } },
      { name: { id: 'Perawatan Tanaman', en: 'Plant Care' } },
      { name: { id: 'Budidaya Tanaman', en: 'Plant Cultivation' } },
      { name: { id: 'Tanaman Langka', en: 'Rare Plants' } },
      { name: { id: 'Tips Dekorasi', en: 'Decoration Tips' } },
      { name: { id: 'Hidroponik & Media Tanam', en: 'Hydroponics & Planting Media' } },
    ],
  });
  console.log('Kategori berhasil dibuat.');

  // --- 4. Pembuatan Data Tipe Tanaman ---
  console.log('Membuat data tipe tanaman...');
  const plantTypes = await prisma.plantType.createManyAndReturn({
    data: [
      { name: { id: 'Anthurium', en: 'Anthurium' } },
      { name: { id: 'Platycerium', en: 'Platycerium' } },
      { name: { id: 'Alocasia', en: 'Alocasia' } },
      { name: { id: 'Monstera', en: 'Monstera' } },
      { name: { id: 'Philodendron', en: 'Philodendron' } },
      { name: { id: 'Calathea', en: 'Calathea' } },
      { name: { id: 'Aglaonema', en: 'Aglaonema' } },
    ],
  });
  console.log('Tipe tanaman berhasil dibuat.');

  // --- 5. Pembuatan 10 Data Plant ---
  console.log('Membuat 10 data plant...');
  const plantsToCreate = [];
  const careLevels = [CareLevel.Mudah, CareLevel.Sedang, CareLevel.Sulit];
  const plantSizes = [PlantSize.Kecil, PlantSize.Sedang, PlantSize.Besar];

  for (let i = 0; i < 10; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomPlantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
    
    plantsToCreate.push({
      name: { id: `${randomPlantType.name.id} Unik #${i + 1}`, en: `Unique ${randomPlantType.name.en} #${i + 1}` },
      scientificName: `${randomPlantType.name.en} species #${i + 1}`,
      description: { id: `Deskripsi untuk ${randomPlantType.name.id} unik.`, en: `Description for the unique ${randomPlantType.name.en}.` },
      imageUrl: '',
      careLevel: careLevels[Math.floor(Math.random() * careLevels.length)],
      size: plantSizes[Math.floor(Math.random() * plantSizes.length)],
      stores: { online: 'Tokopedia', offline: 'Toko Kebun Lokal' },
      categoryId: randomCategory.id,
      familyId: randomPlantType.id,
    });
  }
  await prisma.plant.createMany({ data: plantsToCreate });
  console.log(`${plantsToCreate.length} plant berhasil dibuat.`);

  // --- 6. Pembuatan 10 Data Event ---
  console.log('Membuat 10 data event...');
  const eventsToCreate = [];
  const eventTypes = [EventType.INTERNAL, EventType.EXTERNAL];
  const locations = ['Jakarta Convention Center', 'Online via Zoom', 'Kebun Raya Bogor', 'Taman Mini Indonesia Indah'];

  for (let i = 0; i < 10; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30) - 15); // Acak -15 sampai +15 hari dari sekarang
    const endDate = new Date(startDate);
    // REVISI: Durasi event dibuat lebih lama, antara 2-6 hari
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 5) + 2);
    
    eventsToCreate.push({
      title: { id: `Pameran ${randomCategory.name.id} #${i + 1}`, en: `${randomCategory.name.en} Exhibition #${i + 1}` },
      description: { id: `Deskripsi untuk acara pameran ${randomCategory.name.id}.`, en: `Description for the ${randomCategory.name.en} exhibition event.` },
      imageUrl: '',
      location: locations[Math.floor(Math.random() * locations.length)],
      organizer: 'Narapati Organizer',
      startDate,
      endDate,
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      categoryId: randomCategory.id,
      plantTypeId: i % 2 === 0 ? plantTypes[Math.floor(Math.random() * plantTypes.length)].id : null, // Setengah event punya plantType
    });
  }
  await prisma.event.createMany({ data: eventsToCreate });
  console.log(`${eventsToCreate.length} event berhasil dibuat.`);

  // --- 7. Pembuatan 50 Data Artikel oleh Admin ---
  console.log('Membuat 50 data artikel oleh Admin...');
  const articlesToCreate = [];
  const articleTemplates = [
    { action: 'Cara Mengatasi', subject: 'Hama Kutu Putih pada', category: categories[0] }, // Penyakit
    { action: 'Panduan Lengkap Merawat', subject: '', category: categories[1] }, // Perawatan
    { action: 'Tips Memperbanyak', subject: 'dengan Stek Batang', category: categories[2] }, // Budidaya
    { action: 'Mengenal Keunikan', subject: 'yang Jarang Diketahui', category: categories[3] }, // Langka
    { action: '5 Ide Dekorasi Ruangan dengan', subject: '', category: categories[4] }, // Dekorasi
    { action: 'Media Tanam Terbaik untuk', subject: 'agar Tumbuh Subur', category: categories[5] }, // Media Tanam
    { action: 'Penyebab Daun Menguning pada', subject: 'dan Solusinya', category: categories[0] }, // Penyakit
    { action: 'Jadwal Penyiraman Ideal untuk', subject: 'di Musim Hujan', category: categories[1] }, // Perawatan
  ];
  
  const statuses = [ArticleStatus.PUBLISHED, ArticleStatus.PUBLISHED, ArticleStatus.PUBLISHED, ArticleStatus.DRAFT, ArticleStatus.IN_REVIEW];

  for (let i = 1; i <= 50; i++) {
    const template = articleTemplates[Math.floor(Math.random() * articleTemplates.length)];
    const plantType = plantTypes[Math.floor(Math.random() * plantTypes.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const plantNameId = (template.subject === '') ? plantType.name.id : `${plantType.name.id} ${template.subject}`;
    const plantNameEn = (template.subject === '') ? plantType.name.en : `${plantType.name.en} ${template.subject.replace('pada', 'on').replace('dengan','using')}`;

    const articleTitleId = `${template.action} ${plantNameId}`;
    const articleTitleEn = `${template.action.replace('Cara Mengatasi', 'How to Overcome').replace('Panduan Lengkap Merawat', 'Complete Guide to Care For')} ${plantNameEn}`;

    const article = {
      title: { id: `${articleTitleId} #${i}`, en: `${articleTitleEn} #${i}` },
      excerpt: {
        id: `Ini adalah ringkasan singkat untuk artikel tentang ${articleTitleId}.`,
        en: `This is a short excerpt for the article about ${articleTitleEn}.`,
      },
      content: {
        id: `Konten lengkap untuk artikel #${i} akan membahas secara mendalam tentang ${articleTitleId}.`,
        en: `The full content for article #${i} will discuss in-depth about ${articleTitleEn}.`,
      },
      imageUrl: '',
      authorId: admin.id,
      status: randomStatus,
      categoryId: template.category.id, // Kategori sesuai template
      plantTypeId: plantType.id,      // Tipe tanaman acak
      viewCount: Math.floor(Math.random() * 5000), // view count acak
    };
    articlesToCreate.push(article);
  }

  await prisma.article.createMany({
    data: articlesToCreate,
  });

  console.log(`${articlesToCreate.length} artikel berhasil dibuat.`);
}

main()
  .catch((e) => {
    console.error('Terjadi error saat proses seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Proses seeding selesai.');
  });

