// File: prisma/seed.js

import "dotenv/config";
import {
    PrismaClient,
    Role,
    ArticleStatus,
    EventType,
    AdminEditRequestStatus,
    AdType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Memulai proses seeding...");

    // --- 1. Pembersihan Data ---
    // Urutan penghapusan disesuaikan untuk menghindari constraint errors
    console.log("🧹 Membersihkan data lama...");
    await prisma.store.deleteMany();
    await prisma.eventSubmission.deleteMany();
    await prisma.articleSeo.deleteMany();
    await prisma.article.deleteMany();
    await prisma.plant.deleteMany();
    await prisma.event.deleteMany();
    await prisma.journalistMessage.deleteMany();
    await prisma.bannerImage.deleteMany();
    await prisma.siteSeo.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.siteSettings.deleteMany();
    await prisma.plantType.deleteMany();
    await prisma.category.deleteMany();
    await prisma.adContent.deleteMany();
    await prisma.adPlacement.deleteMany();
    await prisma.user.deleteMany();
    console.log("✅ Data lama berhasil dibersihkan.");

    // --- 2. Pembuatan Data User ---
    console.log("👤 Membuat data user...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const admin = await prisma.user.create({
        data: {
            id: 13,
            email: "admin@narapati.com",
            name: "Admin Narapati",
            password: hashedPassword,
            role: Role.ADMIN,
            address: "Kantor Pusat Narapati Flora, Jakarta",
            phoneNumber: "+6281111111111",
            socialMedia: { linkedin: "https://linkedin.com/in/adminnarapati" },
        },
    });

    await prisma.user.createMany({
        data: [
            {
                id: 15,
                email: "user@narapati.com",
                name: "Siti Rahayu",
                password: hashedPassword,
                role: Role.USER,
                address: "jakartasad",
                phoneNumber: "384734",
                socialMedia: "askdjsa",
            },
            {
                id: 17,
                email: "utarasetya@gmail.com",
                name: "Utara setya",
                password: await bcrypt.hash("password_utara", 10), // Gunakan password berbeda jika perlu
                role: Role.USER,
                address: "asdsa",
                phoneNumber: "085204906165",
                socialMedia: "asda",
            },
            {
                id: 18,
                email: "utara@gmail.com",
                name: "utara setya",
                password: await bcrypt.hash("password_utara2", 10),
                role: Role.JOURNALIST,
            },
            {
                id: 19,
                email: "jurnalis@narapati.com",
                name: "utarasetya",
                password: hashedPassword,
                role: Role.JOURNALIST,
            },
        ],
    });
    console.log("✅ User berhasil dibuat.");

    // --- 3. Pembuatan Data Site Settings, SEO, dan Banner ---
    console.log("⚙️ Membuat data Site Settings...");
    await prisma.siteSettings.create({
        data: {
            id: 1,
            name: "Narapati Flora",
            logoUrl: "/uploads/settings/image-1759858094701-649733789.png",
            faviconUrl: "/uploads/settings/image-1759857605858-247009948.ico",
            shortDescription: {
                en: "Narapatiflora is a platform for ornamental plant enthusiasts and entrepreneurs, with a primary mission to preserve and elevate the value of Indonesia's local flora. ",
                id: "Narapatiflora adalah platform untuk para pencinta dan pelaku usaha tanaman hias yang memiliki misi utama melestarikan serta mengangkat nilai flora lokal Indonesia. ",
            },
            businessDescription: {
                en: "Narapatiflora is a platform for ornamental plant enthusiasts and entrepreneurs, with a primary mission to preserve and elevate the value of Indonesia's local flora. We present a variety of inspiring content, from plant profiles and nursery coverage to hobbyist stories, to promote the importance of preserving the archipelago's biodiversity. With a spirit of collaboration, Narapatiflora serves as a platform for building a strong community and collectively advancing the national ornamental plant industry.",
                id: "Narapatiflora adalah platform untuk para pencinta dan pelaku usaha tanaman hias yang memiliki misi utama melestarikan serta mengangkat nilai flora lokal Indonesia. Kami menyajikan beragam konten inspiratif, mulai dari profil tanaman, liputan nurseri, hingga kisah para pehobi, untuk mengampanyekan pentingnya menjaga kekayaan hayati nusantara. Dengan semangat kolaborasi, Narapatiflora berfungsi sebagai wadah untuk membangun komunitas yang solid dan bersama-sama mendorong kemajuan industri tanaman hias nasional.",
            },
            contactInfo: {
                email: "narapatiflora@gmail.com",
                phone: "+62 81361281036",
                address: "Jl. Sadar No.1, Kota Bekasi, Jawa Barat 17431",
                socialMedia: {
                    tiktok: "https://www.tiktok.com/@narapatiflora",
                    facebook: "-",
                    instagram: "https://www.instagram.com/Narapatiflora",
                },
            },
            bannerTagline: {
                en: "Spread love with beautiful plants for a harmonious life",
                id: "Menebar kasih dengan tanaman indah untuk hidup yang harmonis",
            },
            bannerImages: {
                create: [
                    { id: 34, imageUrl: "/uploads/banners/Tanpa judul (1920 x 640 piksel)-1759865504977.webp" },
                    { id: 35, imageUrl: "/uploads/banners/Tanpa judul (1920 x 640 piksel)-1759866011954.webp" },
                    { id: 36, imageUrl: "/uploads/banners/Tanpa judul (1920 x 640 piksel)-1759866097246.webp" },
                    { id: 37, imageUrl: "/uploads/banners/Tanpa judul (1920 x 640 piksel)-1759866118054.webp" },
                    { id: 38, imageUrl: "/uploads/banners/Tanpa judul (1920 x 640 piksel)-1759866134777.webp" },
                    { id: 39, imageUrl: "/uploads/banners/Tanpa judul (1920 x 640 piksel)-1759866145689.webp" },
                ],
            },
            seo: {
                create: {
                    id: 1,
                    metaTitle: { en: "Narapati Flora - Ornamental Plants & Care Tips Center", id: "Narapati Flora - Pusat Tanaman Hias & Tips Perawatan" },
                    metaDescription: { en: "Find the most complete collection of exotic ornamental plants at Narapati Flora. Get the best care guides for your garden.", id: "Temukan koleksi tanaman hias eksotis terlengkap di Narapati Flora. Dapatkan panduan perawatan terbaik untuk kebun Anda." },
                    metaKeywords: "tanaman hias, jual tanaman, monstera, anthurium, perawatan tanaman",
                    ogDefaultTitle: { en: "829374", id: "23847" },
                    ogDefaultDescription: { en: "asda", id: "asda" },
                    ogDefaultImageUrl: "/uploads/default-social-image.jpg",
                    twitterSite: "@narapatiflora",
                    googleSiteVerificationId: "asda",
                },
            },
        },
    });
    console.log("✅ Site Settings berhasil dibuat.");

    // --- 4. Data Kategori & Tipe Tanaman ---
    console.log("🏷️ Membuat data Kategori dan Tipe Tanaman...");
    await prisma.category.createMany({
        data: [
            { id: 32, name: { en: "Plant", id: "Tanaman" } },
            { id: 33, name: { en: "article", id: "artikel" } },
        ],
    });
    await prisma.plantType.createMany({
        data: [
            { id: 36, name: { en: "Platycerium willinckii", id: "Platycerium willinckii" } },
            { id: 37, name: { en: "Platycerium", id: "Platycerium" } },
        ],
    });
    console.log("✅ Kategori dan Tipe Tanaman berhasil dibuat.");
    
    // --- 5. Data Announcement & Journalist Message ---
    console.log("📢 Membuat data Pengumuman...");
    await prisma.announcement.create({
        data: {
            id: 1,
            journalistAnnouncement: { en: "asda", id: "adasd" },
            userAnnouncement: { en: "asda", id: "asda" },
            journalistRules: { en: "asda", id: "asdsa" },
            userRules: { en: "asd", id: "asda" },
        }
    });
    await prisma.journalistMessage.create({
        data: {
            id: 1,
            title: { en: "Article Writing Guidelines and Rules", id: "Panduan dan Peraturan Penulisan Artikel" },
            content: { en: "Welcome to the journalist dashboard! Ensure every article has valid sources, high-quality images, and follows the specified SEO standards. Articles must be original and informative.", id: "Selamat datang di dasbor jurnalis! Pastikan setiap artikel memiliki sumber yang valid, gambar berkualitas tinggi, dan mengikuti standar SEO yang telah ditentukan. Artikel harus orisinal dan informatif." },
        }
    });
    console.log("✅ Pengumuman berhasil dibuat.");

    // --- 6. Data Tanaman & Toko ---
    console.log("🪴 Membuat data Tanaman dan Toko...");
    await prisma.plant.create({
        data: {
            id: 61,
            name: { en: "Anthurium Black Crystallinum x Hulk Naomi", id: "Anthurium Black Crystallinum x Hulk Naomi" },
            scientificName: "Anthurium crystallinum (Hybrid)",
            description: { en: "Introducing the Anthurium Black Crystallinum x Hulk Naomi, a masterful hybrid that blends exotic elegance with captivating strength. This cross inherits the dark, velvety beauty and shimmering crystalline veins of 'Black Crystallinum', combined with the thick, large, and robust leaf character of the 'Hulk'.\n\nIts commanding presence makes it a perfect statement piece to add a touch of luxury to any corner of your room or premium plant collection. Care is relatively straightforward, similar to other anthuriums, making it an excellent choice for collectors seeking a plant with a dramatic and unique appearance.", id: "Memperkenalkan Anthurium Black Crystallinum x Hulk Naomi, sebuah mahakarya hibrida yang memadukan keanggunan eksotis dengan kekuatan yang memukau. Persilangan ini mewarisi keindahan gelap dan beludru dari 'Black Crystallinum' dengan urat daun kristal yang berkilauan, serta mewarisi karakter daun yang tebal, besar, dan kokoh dari 'Hulk'.\n\nSetiap daun baru yang muncul adalah sebuah kejutan, menampilkan warna gelap yang pekat dengan kontras urat daun yang tegas dan menawan. Sosoknya yang gagah menjadikannya sebagai statement piece yang sempurna untuk menambah sentuhan kemewahan di sudut ruangan atau koleksi tanaman premium Anda." },
            imageUrl: "/uploads/plants/Desain-tanpa-judul-(4)-1759921383346.webp",
            plantTypeId: 36,
            stores: {
                create: [
                    { id: 4, name: "growroom", url: "https://growroom.id/product/123", clicks: 3 }
                ]
            }
        }
    });
    console.log("✅ Tanaman dan Toko berhasil dibuat.");

    // --- 7. Data Event & Submission ---
    console.log("🗓️ Membuat data Event dan Submission...");
    await prisma.event.createMany({
        data: [
            { id: 59, title: { en: "PLANT PHOTO COMPETITION", id: "LOMBA FOTO TANAMAN" }, description: { en: "PLANT PHOTO COMPETITION", id: "LOMBA FOTO TANAMAN" }, imageUrl: "/uploads/events/Narapati-Flora-1759936243643.webp", location: "Online", organizer: "Narapati Organizer", startDate: new Date("2025-10-08T07:59:00.000Z"), endDate: new Date("2025-10-08T10:53:48.210Z"), eventType: "INTERNAL", externalUrl: "" },
            { id: 56, title: { en: "FLOII Expo 2025", id: "FLOII Expo 2025" }, description: { en: "Floriculture Indonesia International (FLOII) Expo, isIndonesia’s first and largest international plant exhibition...", id: "Floriculture Indonesia International (FLOII) Expo adalah pameran tanaman internasional pertama dan terbesar di Indonesia..." }, imageUrl: "/uploads/events/Desain-tanpa-judul-(6)-1759931491573.webp", location: "Hall 5, ICE BSD Tangerang, Indonesia", organizer: "Floriculture Indonesia International Expo", startDate: new Date("2025-10-23T06:45:00.000Z"), endDate: new Date("2025-10-26T06:45:00.000Z"), eventType: "EXTERNAL", externalUrl: "https://floii-expo.com/", externalLinkClicks: 2 },
        ]
    });
    await prisma.eventSubmission.createMany({
        data: [
            { id: 2, eventId: 59, submissionUrl: "/uploads/submissions/Narapati-Flora-(1)-1759945761378.webp", submissionNotes: "asdadas", userId: 17, placement: 1 },
            { id: 1, eventId: 59, submissionUrl: "/uploads/submissions/Narapati-Flora-1759940872244.webp", submissionNotes: "saad", userId: 15, placement: 2 },
        ]
    });
    console.log("✅ Event dan Submission berhasil dibuat.");

    // --- 8. Data Artikel & SEO ---
    console.log("📰 Membuat data Artikel dan SEO...");
    // Menggunakan create individual karena ada relasi SEO
    await prisma.article.create({
        data: {
            id: 254, title: { en: "Soygeboy Platycerium: Collect and Care for Exclusive Platycerium with Superior Characteristics", id: "Soygeboy Platycerium : Koleksi dan Rawat Platycerium Eksklusif dengan Karakter Unggul " }, excerpt: { en: "...", id: "..." }, content: { en: "...", id: "..." }, imageUrl: "/uploads/artikel/Narapati-Flora-1759955866773.webp", authorId: 13, status: "DRAFT", categoryId: 32, plantTypeId: 36,
        }
    });
    await prisma.article.create({
        data: {
            id: 252, title: { en: "Platycerium willinckii \"Masayu\": A Local Staghorn Fern, the Pride of Indonesia", id: "Platycerium willickii \"Masayu\": Tanaman Paku Tanduk Rusa Lokal Kebanggaan Indonesia" }, excerpt: { en: "...", id: "..." }, content: { en: "...", id: "..." }, imageUrl: "/uploads/artikel/Desain-tanpa-judul-(4)-1759953568018.webp", authorId: 13, status: "PUBLISHED", viewCount: 1, categoryId: 32, plantTypeId: 36,
            seo: { create: { id: 101, metaTitle: { en: "Platycerium willinckii \"Masayu\": A Rare Dwarf Staghorn Fern from Indonesia", id: "Platycerium willinckii \"Masayu\": Paku Tanduk Rusa Lokal Unik & Langka" }, metaDescription: { en: "...", id: "..." }, keywords: "...", canonicalUrl: "http://localhost:5173/articles/252", ogImageUrl: "...", twitterImageUrl: "...", twitterSite: "@plenteriaid", twitterCreator: "@Intannobita", structuredData: { "@type": "Article", "headline": "..." } } }
        }
    });
    // ... Tambahkan create untuk artikel lainnya (253, 256, 257) dengan cara yang sama
    console.log("✅ Artikel dan SEO berhasil dibuat.");

}

main()
    .catch((e) => {
        console.error("❌ Terjadi error saat proses seeding:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("🏁 Proses seeding selesai.");
    });