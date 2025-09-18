import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper untuk transformasi URL gambar (digunakan oleh semua fungsi)
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
// Obyek `select` untuk meringkas data (Digunakan di Home & Search)
// =================================================================
const popularAndLatestArticleSelect = {
  id: true,
  title: true,
  excerpt: true,
  imageUrl: true,
  viewCount: true,
  category: { select: { name: true } },
  _count: { select: { likes: true } }
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
  careLevel: true,
  size: true
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
  categoryId: true, plantTypeId: true,
  author: { select: { name: true, role: true } },
  category: { select: { id: true, name: true } },
  plantType: { select: { id: true, name: true } }
};

const articleDetailSelect = {
  id: true, title: true, excerpt: true, content: true, imageUrl: true, authorId: true,
  status: true, createdAt: true, categoryId: true, plantTypeId: true,
  author: { select: { name: true, role: true } },
  category: { select: { id: true, name: true } },
  plantType: { select: { id: true, name: true } },
  _count: { select: { likes: true } }
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
  id: true, name: true, scientificName: true, imageUrl: true,
  // DIHAPUS: categoryId
  familyId: true,
  // DIHAPUS: relasi category
  family: { select: { id: true, name: true } }
};

const plantDetailSelect = {
  id: true, name: true, scientificName: true, description: true, imageUrl: true,
  careLevel: true, size: true, stores: true, 
  // DIHAPUS: categoryId
  familyId: true,
  // DIHAPUS: relasi category
  family: { select: { id: true, name: true } }
};


// =================================================================
// #1 FUNGSI DATA LAYOUT DASAR
// Endpoint: GET /api/layout
// =================================================================
export const getLayoutData = async (req, res) => {
    try {
        const [siteSettings, categories, plantTypes] = await prisma.$transaction([
            prisma.siteSettings.findUnique({ where: { id: 1 }, select: { name: true, logoUrl: true, faviconUrl: true, businessDescription: true, contactInfo: true, seo: true, googleAnalyticsId: true, googleAdsId: true, metaPixelId: true } }),
            prisma.category.findMany({ orderBy: { id: 'asc' } }),
            prisma.plantType.findMany({ orderBy: { id: 'asc' } })
        ]);
        res.json({ settings: transformImageUrls(req, siteSettings), categories, plantTypes });
    } catch (error) {
        console.error("Error fetching layout data:", error);
        res.status(500).json({ error: 'Gagal mengambil data layout.' });
    }
};

// =================================================================
// #2 FUNGSI DATA HALAMAN UTAMA (HOME)
// Endpoint: GET /api/home
// =================================================================
export const getHomePageData = async (req, res) => {
    try {
        const now = new Date();
        const [
            siteSettings, 
            categories, 
            plantTypes, 
            mostViewedArticle,
            latestArticles,
            topHeadlines,
            runningEvents, 
            recentPlants
        ] = await prisma.$transaction([
            prisma.siteSettings.findUnique({ where: { id: 1 }, include: { bannerImages: true } }),
            prisma.category.findMany({ orderBy: { id: 'asc' } }),
            prisma.plantType.findMany({ orderBy: { id: 'asc' } }),
            prisma.article.findFirst({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, select: popularAndLatestArticleSelect }),
            prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, take: 2, select: popularAndLatestArticleSelect }),
            prisma.article.findMany({ where: { status: 'PUBLISHED' }, orderBy: { viewCount: 'desc' }, take: 5, select: topHeadlineSelect }),
            prisma.event.findMany({ where: { startDate: { lte: now }, endDate: { gte: now } }, orderBy: { startDate: 'asc' }, take: 1, select: homeEventSelect }),
            prisma.plant.findMany({ orderBy: { createdAt: 'desc' }, take: 1, select: homePlantSelect })
        ]);

        const responseData = {
            bannerTagline: siteSettings?.bannerTagline,
            bannerImages: transformImageUrls(req, siteSettings?.bannerImages || []),
            plantTypes,
            categories,
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

// =================================================================
// #3 FUNGSI PENCARIAN GLOBAL
// Endpoint: GET /api/search?q=...
// =================================================================
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

// =================================================================
// #4 FUNGSI DAFTAR ARTIKEL (PAGINATION & FILTER)
// Endpoint: GET /api/articles
// =================================================================
export const getArticles = async (req, res) => {
  const { page = 1, limit = 10, search, categoryId, plantTypeId, startDate, endDate } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = { status: 'PUBLISHED' };
  if (search) { where.OR = [{ title: { path: ['id'], string_contains: search, mode: 'insensitive' } },{ excerpt: { path: ['id'], string_contains: search, mode: 'insensitive' } }];}
  if (categoryId) where.categoryId = parseInt(categoryId);
  if (plantTypeId) where.plantTypeId = parseInt(plantTypeId);
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  try {
    const [totalArticles, articlesFromDb] = await prisma.$transaction([
      prisma.article.count({ where }),
      prisma.article.findMany({ where, skip, take: limitNum, select: articleListSelect, orderBy: { createdAt: 'desc' } })
    ]);
    const totalPages = Math.ceil(totalArticles / limitNum);

    res.json({
      data: articlesFromDb.map(item => transformImageUrls(req, item)),
      pagination: { totalItems: totalArticles, totalPages, currentPage: pageNum, itemsPerPage: limitNum }
    });
  } catch (error) {
    console.error("Get Articles Error:", error);
    res.status(500).json({ error: 'Gagal mengambil data artikel.' });
  }
};

// =================================================================
// #5 FUNGSI DAFTAR TANAMAN (PAGINATION & FILTER)
// Endpoint: GET /api/plants
// =================================================================
export const getPlants = async (req, res) => {
  // DIHAPUS: categoryId dari query
  const { page = 1, limit = 12, search, familyId } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (search) { where.OR = [{ name: { path: ['id'], string_contains: search, mode: 'insensitive' } },{ scientificName: { contains: search, mode: 'insensitive' } }];}
  // DIHAPUS: Filter berdasarkan categoryId
  if (familyId) where.familyId = parseInt(familyId);

  try {
    const [totalPlants, plantsFromDb] = await prisma.$transaction([
      prisma.plant.count({ where }),
      prisma.plant.findMany({ where, skip, take: limitNum, select: plantListSelect, orderBy: { name: 'asc' } })
    ]);
    const totalPages = Math.ceil(totalPlants / limitNum);
    
    res.json({
      data: plantsFromDb.map(item => transformImageUrls(req, item)),
      pagination: { totalItems: totalPlants, totalPages, currentPage: pageNum, itemsPerPage: limitNum }
    });
  } catch (error) {
    console.error("Get Plants Error:", error);
    res.status(500).json({ error: 'Gagal mengambil data tanaman.' });
  }
};

// =================================================================
// #6 FUNGSI DAFTAR EVENT (PAGINATION & FILTER)
// Endpoint: GET /api/events
// =================================================================
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
      data: eventsFromDb.map(item => transformImageUrls(req, item)),
      pagination: { totalItems: totalEvents, totalPages, currentPage: pageNum, itemsPerPage: limitNum }
    });
  } catch (error) {
    console.error("Get Events Error:", error);
    res.status(500).json({ error: 'Gagal mengambil data event.' });
  }
};

// =================================================================
// #7 FUNGSI DETAIL ARTIKEL (UNTUK PUBLIK)
// Endpoint: GET /api/articles/:id
// =================================================================
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

// =================================================================
// #8 FUNGSI LIKE / UNLIKE ARTIKEL (UNTUK PUBLIK)
// Endpoint: POST /api/articles/:id/like
// =================================================================
export const toggleArticleLike = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    const userId = req.user.userId;

    if (isNaN(articleId) || !userId) return res.status(400).json({ error: 'Invalid Article ID or user not authenticated' });

    try {
        const likeId = { userId, articleId };
        const existingLike = await prisma.like.findUnique({ where: { userId_articleId: likeId } });

        if (existingLike) {
            await prisma.like.delete({ where: { userId_articleId: likeId } });
            res.json({ message: 'Article unliked' });
        } else {
            await prisma.like.create({ data: likeId });
            res.json({ message: 'Article liked' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Could not process like action.' });
    }
};

// =================================================================
// #9 FUNGSI DETAIL TANAMAN (UNTUK PUBLIK)
// Endpoint: GET /api/plants/:id
// =================================================================
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

// =================================================================
// #10 FUNGSI DETAIL EVENT (UNTUK PUBLIK)
// Endpoint: GET /api/events/:id
// =================================================================
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

// =================================================================
// #11 FUNGSI MELACAK KLIK LINK EKSTERNAL EVENT (UNTUK PUBLIK)
// Endpoint: POST /api/events/:id/track-click
// =================================================================
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

// =================================================================
// #12 FUNGSI DATA HALAMAN TENTANG KAMI (ABOUT)
// Endpoint: GET /api/about
// =================================================================
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