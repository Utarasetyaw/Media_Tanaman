import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper untuk transformasi URL gambar
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

// =================================================================
// Obyek `select`
// =================================================================
const popularAndLatestArticleSelect = {
  id: true,
  title: true,
  excerpt: true,
  imageUrl: true,
  createdAt: true,
  viewCount: true,
  likeCount: true,
  category: { select: { name: true } },
};

const topHeadlineSelect = {
  id: true,
  title: true
};

const homePlantSelect = {
  id: true,
  name: true,
  scientificName: true,
  description: true,
  imageUrl: true,
};

const homeEventSelect = {
  id: true,
  title: true,
  imageUrl: true,
  location: true,
  startDate: true
};

const articleListSelect = {
  id: true, title: true, excerpt: true, content: true, imageUrl: true, status: true,
  createdAt: true,
  viewCount: true,
  likeCount: true,
  categoryId: true, plantTypeId: true,
  author: { select: { name: true, role: true } },
  category: { select: { id: true, name: true } },
  plantType: { select: { id: true, name: true } }
};

const articleDetailSelect = {
  id: true, title: true, excerpt: true, content: true, imageUrl: true, authorId: true,
  status: true, createdAt: true, categoryId: true, plantTypeId: true,
  likeCount: true,
  author: { select: { name: true, role: true } },
  category: { select: { id: true, name: true } },
  plantType: { select: { id: true, name: true } },
  seo: true,
};

const eventListSelect = {
  id: true, title: true, description: true, imageUrl: true,
  location: true, organizer: true, startDate: true, endDate: true,
};

const eventDetailSelect = {
  id: true, title: true, description: true, imageUrl: true,
  location: true, organizer: true, startDate: true, endDate: true,
  externalUrl: true, eventType: true
};

const plantListSelect = {
  id: true,
  name: true,
  description: true,
  imageUrl: true,
  plantTypeId: true,
  plantType: { select: { id: true, name: true } }
};

const plantDetailSelect = {
  id: true, name: true, scientificName: true, description: true, imageUrl: true,
  stores: true,
  plantTypeId: true,
  plantType: { select: { id: true, name: true } }
};


// =================================================================
// Controller Functions
// =================================================================

export const getLayoutData = async (req, res) => {
    try {
        const siteSettings = await prisma.siteSettings.findUnique({
            where: { id: 1 },
            select: {
                name: true,
                logoUrl: true,
                faviconUrl: true,
                businessDescription: true,
                contactInfo: true,
                googleAdsId: true,
                seo: true
            }
        });

        const [categories, plantTypes] = await prisma.$transaction([
            prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
            prisma.plantType.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
        ]);

        res.json({
            settings: transformImageUrls(req, siteSettings),
            categories,
            plantTypes,
        });
    } catch (error) {
        console.error("Error fetching layout data:", error);
        res.status(500).json({ error: 'Gagal mengambil data layout.' });
    }
};

export const getHomePageData = async (req, res) => {
    try {
        const now = new Date();
        const [
            siteSettings,
            mostViewedArticle,
            latestArticles,
            topHeadlines,
            runningEvents,
            recentPlants
        ] = await prisma.$transaction([
            prisma.siteSettings.findUnique({ 
                where: { id: 1 }, 
                include: { 
                    bannerImages: true,
                    seo: true 
                } 
            }),
            prisma.article.findFirst({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, select: popularAndLatestArticleSelect }),
            prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, take: 2, select: popularAndLatestArticleSelect }),
            prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, take: 5, select: topHeadlineSelect }),
            prisma.event.findMany({ where: { startDate: { lte: now }, endDate: { gte: now } }, orderBy: { startDate: 'asc' }, take: 1, select: homeEventSelect }),
            prisma.plant.findMany({ orderBy: { createdAt: 'desc' }, take: 1, select: homePlantSelect })
        ]);
        
        const responseData = {
            settings: transformImageUrls(req, siteSettings),
            mostViewedArticle: transformImageUrls(req, mostViewedArticle),
            latestArticles: transformImageUrls(req, latestArticles),
            topHeadlines,
            runningEvents: transformImageUrls(req, runningEvents),
            plants: transformImageUrls(req, recentPlants),
        };
        
        res.json(responseData);
    } catch (error) {
        console.error("Error fetching home page data:", error);
        res.status(500).json({ error: 'Gagal mengambil data untuk halaman utama.' });
    }
};

export const searchSite = async (req, res) => {
    const { q: query } = req.query;
    if (!query || String(query).trim().length < 3) return res.json({ articles: [], plants: [], events: [] });
    const searchQuery = String(query).trim();

    try {
        const [articles, plants, events] = await Promise.all([
            prisma.article.findMany({ where: { status: 'PUBLISHED', OR: [{ title: { path: ['id'], string_contains: searchQuery, mode: 'insensitive' } }, { excerpt: { path: ['id'], string_contains: searchQuery, mode: 'insensitive' } }] }, take: 5, select: { id: true, title: true, imageUrl: true, category: { select: { name: true } } } }),
            prisma.plant.findMany({ where: { OR: [{ name: { path: ['id'], string_contains: searchQuery, mode: 'insensitive' } }, { scientificName: { contains: searchQuery, mode: 'insensitive' } }] }, take: 5, select: { id: true, name: true, imageUrl: true } }),
            prisma.event.findMany({ where: { OR: [{ title: { path: ['id'], string_contains: searchQuery, mode: 'insensitive' } }, { location: { contains: searchQuery, mode: 'insensitive' } }] }, take: 5, select: { id: true, title: true, imageUrl: true, location: true } })
        ]);
        res.json({
            articles: transformImageUrls(req, articles),
            plants: transformImageUrls(req, plants),
            events: transformImageUrls(req, events),
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: 'Terjadi kesalahan saat melakukan pencarian.' });
    }
};

export const getArticles = async (req, res) => {
  const { page = 1, limit = 10, search, categoryId, plantTypeId } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = { status: 'PUBLISHED' };
  if (search) { where.OR = [{ title: { path: ['id'], string_contains: search, mode: 'insensitive' } },{ excerpt: { path: ['id'], string_contains: search, mode: 'insensitive' } }];}
  if (categoryId) where.categoryId = parseInt(categoryId);
  if (plantTypeId) where.plantTypeId = parseInt(plantTypeId);

  try {
    const [totalArticles, articlesFromDb] = await prisma.$transaction([
      prisma.article.count({ where }),
      prisma.article.findMany({ where, skip, take: limitNum, select: articleListSelect, orderBy: { createdAt: 'desc' } })
    ]);
    const totalPages = Math.ceil(totalArticles / limitNum);

    res.json({
      data: transformImageUrls(req, articlesFromDb),
      pagination: { totalItems: totalArticles, totalPages, currentPage: pageNum, itemsPerPage: limitNum }
    });
  } catch (error) {
    console.error("Get Articles Error:", error);
    res.status(500).json({ error: 'Gagal mengambil data artikel.' });
  }
};

export const getPlants = async (req, res) => {
  const { page = 1, limit = 12, search, plantTypeId } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (search) { where.OR = [{ name: { path: ['id'], string_contains: search, mode: 'insensitive' } },{ scientificName: { contains: search, mode: 'insensitive' } }];}
  
  if (plantTypeId) where.plantTypeId = parseInt(plantTypeId);

  try {
    const [totalPlants, plantsFromDb] = await prisma.$transaction([
      prisma.plant.count({ where }),
      prisma.plant.findMany({ where, skip, take: limitNum, select: plantListSelect, orderBy: { name: 'asc' } })
    ]);
    const totalPages = Math.ceil(totalPlants / limitNum);
    
    const processedPlants = plantsFromDb.map(plant => {
        const originalDescId = plant.description?.id || ''; 
        const originalDescEn = plant.description?.en || ''; 
        const truncatedDescId = originalDescId.length > 150 ? originalDescId.substring(0, 150) + '...' : originalDescId;
        const truncatedDescEn = originalDescEn.length > 150 ? originalDescEn.substring(0, 150) + '...' : originalDescEn;
        return { ...plant, description: { id: truncatedDescId, en: truncatedDescEn } };
    });
    
    res.json({
      data: transformImageUrls(req, processedPlants),
      pagination: { totalItems: totalPlants, totalPages, currentPage: pageNum, itemsPerPage: limitNum }
    });
  } catch (error) {
    console.error("Get Plants Error:", error);
    res.status(500).json({ error: 'Gagal mengambil data tanaman.' });
  }
};

export const getEvents = async (req, res) => {
  const { page = 1, limit = 5, search } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (search) { where.OR = [{ title: { path: ['id'], string_contains: search, mode: 'insensitive' } },{ location: { contains: search, mode: 'insensitive' } },{ organizer: { contains: search, mode: 'insensitive' } }];}
  
  try {
    const [totalEvents, eventsFromDb] = await prisma.$transaction([
      prisma.event.count({ where }),
      prisma.event.findMany({ where, skip, take: limitNum, select: eventListSelect, orderBy: { startDate: 'desc' } })
    ]);
    const totalPages = Math.ceil(totalEvents / limitNum);

    res.json({
      data: transformImageUrls(req, eventsFromDb),
      pagination: { totalItems: totalEvents, totalPages, currentPage: pageNum, itemsPerPage: limitNum }
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ error: 'Gagal mengambil data event.' });
  }
};

export const getArticleById = async (req, res) => {
  const { id } = req.params;
  try {
    const articleId = parseInt(id);
    const [articleFromDb] = await prisma.$transaction([
      prisma.article.findFirst({ where: { id: articleId, status: 'PUBLISHED' }, select: articleDetailSelect }),
      prisma.article.update({ where: { id: articleId }, data: { viewCount: { increment: 1 } } }),
    ]);

    if (!articleFromDb) return res.status(404).json({ error: 'Article not found' });
    res.json(transformImageUrls(req, articleFromDb));
  } catch (error) {
    res.status(404).json({ error: 'Article not found or could not be updated.' });
  }
};

export const toggleArticleLike = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
        return res.status(400).json({ error: 'Invalid Article ID' });
    }

    try {
        const updatedArticle = await prisma.article.update({
            where: { id: articleId },
            data: {
                likeCount: {
                    increment: 1
                }
            },
            select: {
                likeCount: true
            }
        });
        res.json({ message: 'Article liked successfully', likeCount: updatedArticle.likeCount });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(500).json({ error: 'Could not process like action.' });
    }
};

export const getPlantById = async (req, res) => {
  const { id } = req.params;
  const plantId = parseInt(id);
  if (isNaN(plantId)) return res.status(400).json({ error: 'Invalid Plant ID.' });
  try {
    const plantFromDb = await prisma.plant.findUnique({
      where: { id: plantId },
      select: plantDetailSelect
    });
    if (!plantFromDb) return res.status(404).json({ error: 'Plant not found' });
    res.json(transformImageUrls(req, plantFromDb));
  } catch (error) {
    console.error("Get Plant By ID Error:", error);
    res.status(500).json({ error: 'Failed to fetch plant details.' });
  }
};

export const getEventById = async (req, res) => {
  const { id } = req.params;
  const eventId = parseInt(id);
  if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid Event ID.' });
  try {
    const eventFromDb = await prisma.event.findUnique({
      where: { id: eventId },
      select: eventDetailSelect
    });
    if (!eventFromDb) return res.status(404).json({ error: 'Event not found' });
    res.json(transformImageUrls(req, eventFromDb));
  } catch(error) {
      res.status(500).json({ error: 'Failed to fetch event details' });
  }
};

export const trackEventClick = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.event.update({
      where: { id: parseInt(id) },
      data: { externalLinkClicks: { increment: 1 } },
    });
    res.status(200).json({ message: 'Click tracked' });
  } catch (error) {
    res.status(404).json({ error: 'Event not found' });
  }
};

export const getAboutPageData = async (req, res) => {
    try {
        const aboutData = await prisma.siteSettings.findUnique({
            where: { id: 1 },
            select: {
                name: true,
                logoUrl: true,
                businessDescription: true,
                contactInfo: true,
                faqs: true,
                companyValues: true,
                privacyPolicy: true,
            }
        });

        if (!aboutData) {
            return res.status(404).json({ error: 'About page settings not found.' });
        }
        
        const transformedData = transformImageUrls(req, aboutData);

        res.json(transformedData);

    } catch (error) {
        console.error("Error fetching about page data:", error);
        res.status(500).json({ error: 'Gagal mengambil data halaman Tentang Kami.' });
    }
};

// --- CONTROLLER BARU UNTUK MENGAMBIL IKLAN ---
export const getAdPlacementsByType = async (req, res) => {
    const { type } = req.params; // 'VERTICAL', 'HORIZONTAL', atau 'BANNER'

    // Validasi tipe
    if (!['VERTICAL', 'HORIZONTAL', 'BANNER'].includes(type.toUpperCase())) {
        return res.status(400).json({ error: 'Tipe iklan tidak valid.' });
    }

    try {
        // Cari semua placement yang aktif dengan tipe yang sesuai
        const placements = await prisma.adPlacement.findMany({
            where: {
                type: type.toUpperCase(),
                isActive: true
            },
            include: {
                // Sertakan hanya konten iklan yang juga aktif
                ads: {
                    where: {
                        isActive: true
                    },
                    select: {
                        imageUrl: true,
                        linkUrl: true
                    }
                }
            }
        });

        // Gabungkan semua konten iklan dari semua placement yang ditemukan menjadi satu array
        const allAds = placements.flatMap(placement => placement.ads);

        res.json(transformImageUrls(req, allAds));
    } catch (error) {
        console.error(`Error fetching ${type} ads:`, error);
        res.status(500).json({ error: 'Gagal mengambil data iklan.' });
    }
};