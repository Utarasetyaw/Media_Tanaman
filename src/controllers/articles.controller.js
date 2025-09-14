import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper untuk mengubah path gambar relatif menjadi URL lengkap
const transformArticleImage = (req, article) => {
  if (article && article.imageUrl && article.imageUrl.startsWith('/')) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return { ...article, imageUrl: `${baseUrl}${article.imageUrl}` };
  }
  return article;
};

// Obyek `include` yang bisa dipakai ulang untuk konsistensi
const articleInclude = {
  author: { select: { name: true, role: true } }, 
  category: { select: { id: true, name: true } },
  plantType: { select: { id: true, name: true } },
  _count: {
    select: { likes: true },
  },
};


// === Endpoint untuk Pengguna Terautentikasi (Jurnalis & Admin) ===

export const createArticle = async (req, res) => {
  // Ambil juga 'status' dari request body, beri nama alias 'requestedStatus'
  const { title, excerpt, content, imageUrl, categoryId, plantTypeId, seo, status: requestedStatus } = req.body;
  const authorId = req.user.userId;

  if (!title?.id || !excerpt?.id || !content?.id || !categoryId) {
    return res.status(400).json({ error: 'Title, excerpt, content, and categoryId are required.' });
  }

  const userRole = req.user.role;
  let finalStatus; // Variabel untuk menyimpan status final

  // --- LOGIKA BARU YANG SUDAH DIPERBAIKI ---
  // Jika user adalah ADMIN dan mengirim status yang valid ('PUBLISHED' atau 'DRAFT'), gunakan status itu.
  if (userRole === 'ADMIN' && (requestedStatus === 'PUBLISHED' || requestedStatus === 'DRAFT')) {
    finalStatus = requestedStatus;
  } else {
    // Jika tidak (misalnya user adalah JURNALIS), selalu default ke 'DRAFT'.
    finalStatus = 'DRAFT';
  }

  const data = {
    title, 
    excerpt, 
    content, 
    imageUrl,
    authorId, 
    status: finalStatus, // Gunakan status final yang sudah ditentukan
    categoryId: parseInt(categoryId),
    plantTypeId: plantTypeId ? parseInt(plantTypeId) : null,
    seo: userRole === 'ADMIN' ? seo : undefined,
  };

  try {
    const articleFromDb = await prisma.article.create({ 
        data,
        include: articleInclude
    });
    res.status(201).json(transformArticleImage(req, articleFromDb));
  } catch (error) {
    console.error("Create article error:", error);
    res.status(500).json({ error: 'Could not create article.' });
  }
};

export const getMyArticles = async (req, res) => {
  const authorId = req.user.userId;
  if (!authorId) {
    return res.status(400).json({ error: "User ID not found in token." });
  }
  const articlesFromDb = await prisma.article.findMany({
    where: { authorId },
    include: articleInclude,
    orderBy: { updatedAt: 'desc' },
  });
  const articles = articlesFromDb.map(article => transformArticleImage(req, article));
  res.json(articles);
};

export const getMyArticleAnalytics = async (req, res) => {
  const { id } = req.params;
  const articleId = parseInt(id);
  const user = req.user; // Ambil info user dari token

  if (isNaN(articleId)) {
    return res.status(400).json({ error: 'Invalid Article ID' });
  }

  try {
    const whereClause = { id: articleId };

    if (user.role !== 'ADMIN') {
      whereClause.authorId = user.userId;
    }
    
    const articleFromDb = await prisma.article.findFirst({
      where: whereClause,
      include: articleInclude,
    });

    if (!articleFromDb) {
      return res.status(404).json({ error: 'Article not found or you do not have access.' });
    }
    
    const article = transformArticleImage(req, articleFromDb);
    res.json(article);
  } catch (error) {
    console.error("Error fetching article analytics:", error);
    res.status(500).json({ error: 'Could not fetch article analytics.' });
  }
};

export const updateArticle = async (req, res) => {
  const { id } = req.params;
  const articleId = parseInt(id);
  const dataToUpdate = req.body;
  const user = req.user;

  if (isNaN(articleId)) {
    return res.status(400).json({ error: 'Invalid Article ID' });
  }

  if (dataToUpdate.categoryId) dataToUpdate.categoryId = parseInt(dataToUpdate.categoryId);
  if ('plantTypeId' in dataToUpdate) {
    dataToUpdate.plantTypeId = dataToUpdate.plantTypeId ? parseInt(dataToUpdate.plantTypeId) : null;
  }

  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return res.status(404).json({ error: 'Article not found' });

  const isOwner = article.authorId === user.userId;
  const isAdmin = user.role === 'ADMIN';
  const canAdminEdit = isAdmin && (article.authorId === user.userId || article.adminEditRequest === 'APPROVED');
  const isJournalistEditableStatus = ['DRAFT', 'NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(article.status);

  if (!canAdminEdit && !(isOwner && isJournalistEditableStatus)) {
      return res.status(403).json({ error: 'You do not have permission to edit this article at its current state.' });
  }
  
  try {
    if (dataToUpdate.imageUrl && article.imageUrl && dataToUpdate.imageUrl !== article.imageUrl && !article.imageUrl.startsWith('http')) {
        const oldImageName = article.imageUrl.split('/').pop();
        const oldImagePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'artikel', oldImageName);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }
    
    const updatedArticleFromDb = await prisma.article.update({
      where: { id: articleId },
      data: dataToUpdate,
      include: articleInclude
    });
    res.json(transformArticleImage(req, updatedArticleFromDb));
  } catch (error) {
    console.error("Update article error:", error);
    res.status(500).json({ error: 'Could not update article.' });
  }
};

export const deleteMyArticle = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    const userId = req.user.userId;

    if (isNaN(articleId)) {
        return res.status(400).json({ error: 'Invalid Article ID' });
    }

    try {
        const article = await prisma.article.findUnique({ where: { id: articleId } });

        if (!article) { return res.status(404).json({ error: 'Article not found' }); }
        if (article.authorId !== userId) { return res.status(403).json({ error: 'You are not authorized to delete this article.' }); }

        // REVISI: Tambahkan 'PUBLISHED' ke dalam array ini
        const deletableStatuses = ['DRAFT', 'REJECTED', 'NEEDS_REVISION', 'PUBLISHED'];
        
        if (!deletableStatuses.includes(article.status)) {
            return res.status(403).json({ error: `Cannot delete article with status '${article.status}'.` });
        }

        if (article.imageUrl && !article.imageUrl.startsWith('http')) {
            const imageName = article.imageUrl.split('/').pop();
            const imagePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'artikel', imageName);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await prisma.article.delete({ where: { id: articleId } });

        res.status(204).send();
    } catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).json({ error: 'Could not delete article.' });
    }
};

export const submitArticleForReview = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) return res.status(400).json({ error: 'Invalid Article ID' });

    const article = await prisma.article.findUnique({ where: { id: articleId }});

    if (!article || article.authorId !== req.user.userId) {
        return res.status(404).json({ error: 'Article not found or you are not the author' });
    }
    
    if (!article.imageUrl) {
        return res.status(400).json({ error: 'An article must have a main image before being submitted for review.' });
    }
    
    if (!['DRAFT', 'NEEDS_REVISION', 'REVISED'].includes(article.status)) {
        return res.status(400).json({ error: 'Only drafts or revised articles can be submitted' });
    }

    const updatedArticleFromDb = await prisma.article.update({
        where: { id: articleId },
        data: { status: 'IN_REVIEW' },
        include: articleInclude
    });

    res.json({ 
      message: 'Article submitted for review', 
      article: transformArticleImage(req, updatedArticleFromDb) 
    });
};

export const getJournalistDashboardStats = async (req, res) => {
  const authorId = req.user.userId;

  if (!authorId) {
    return res.status(400).json({ error: "User ID not found in token." });
  }
  
  try {
    const published = await prisma.article.count({ where: { authorId, status: 'PUBLISHED' } });
    const inReview = await prisma.article.count({ where: { authorId, status: { in: ['IN_REVIEW', 'REVISED'] } } });
    const needsRevision = await prisma.article.count({ where: { authorId, status: { in: ['NEEDS_REVISION', 'JOURNALIST_REVISING'] } } });
    const adminRequest = await prisma.article.count({ where: { authorId, adminEditRequest: 'PENDING' } });
    const rejected = await prisma.article.count({ where: { authorId, status: 'REJECTED' } });

    const recentArticlesFromDb = await prisma.article.findMany({
      where: { authorId },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: articleInclude
    });

    const recentArticles = recentArticlesFromDb.map(article => transformArticleImage(req, article));

    res.json({
      stats: { published, inReview, needsRevision, adminRequest, rejected },
      recentArticles,
    });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch journalist dashboard stats.' });
  }
};


// === Endpoint Khusus Admin ===

export const getAllArticlesForAdmin = async (req, res) => {
  const articlesFromDb = await prisma.article.findMany({
    include: articleInclude,
    orderBy: { updatedAt: 'desc' },
  });
  const articles = articlesFromDb.map(article => transformArticleImage(req, article));
  res.json(articles);
};

export const updateArticleStatus = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    const { status, feedback } = req.body;

    if (isNaN(articleId)) return res.status(400).json({ error: 'Invalid Article ID' });
    
    const validStatuses = ['PUBLISHED', 'NEEDS_REVISION', 'REJECTED'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided for an admin action.' });
    }

    try {
        const updatedArticleFromDb = await prisma.article.update({
            where: { id: articleId },
            data: { 
                status, 
                feedback: feedback || null,
                adminEditRequest: status === 'PUBLISHED' ? 'NONE' : undefined
            },
            include: articleInclude
        });
        res.json({ 
          message: `Article status updated to ${status}`, 
          article: transformArticleImage(req, updatedArticleFromDb) 
        });
    } catch (error) {
        res.status(404).json({ error: 'Article not found.' });
    }
};

export const deleteArticle = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    if (isNaN(articleId)) return res.status(400).json({ error: 'Invalid Article ID' });
    try {
        const article = await prisma.article.findUnique({ where: { id: articleId }});
        if (article && article.imageUrl && !article.imageUrl.startsWith('http')) {
            const imageName = article.imageUrl.split('/').pop();
            const imagePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'artikel', imageName);
             if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await prisma.article.delete({ where: { id: articleId } });
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: 'Article not found' });
    }
};

export const getAdminDashboardStats = async (req, res) => {
    try {
        const totalPublished = await prisma.article.count({ where: { status: 'PUBLISHED' } });
        const journalistRequests = await prisma.article.count({ where: { status: 'IN_REVIEW' } });
        const needsRevision = await prisma.article.count({ where: { status: { in: ['NEEDS_REVISION', 'JOURNALIST_REVISING', 'REVISED'] } } });
        const adminEditPending = await prisma.article.count({ where: { adminEditRequest: 'PENDING' } });
        const totalRejected = await prisma.article.count({ where: { status: 'REJECTED' } });

        const recentActivityFromDb = await prisma.article.findMany({
            where: { OR: [ { status: 'IN_REVIEW' }, { status: 'NEEDS_REVISION' }, { adminEditRequest: 'PENDING' } ] },
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: articleInclude
        });

        const recentActivity = recentActivityFromDb.map(act => transformArticleImage(req, act));

        res.json({
            stats: { totalPublished, journalistRequests, needsRevision, adminEditPending, totalRejected },
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch admin dashboard stats.' });
    }
};


// --- Alur Kerja Edit, & Revisi Jurnalis ---

export const requestEditAccess = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    if (isNaN(articleId)) return res.status(400).json({ error: 'Invalid Article ID' });
    try {
        const articleFromDb = await prisma.article.update({
            where: { id: articleId },
            data: { adminEditRequest: 'PENDING' },
            include: articleInclude
        });
        res.json({ 
          message: 'Edit access requested.', 
          article: transformArticleImage(req, articleFromDb) 
        });
    } catch (error) {
        res.status(404).json({ error: 'Article not found.' });
    }
};

export const cancelAdminEditRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await prisma.article.update({
            where: { id: parseInt(id), adminEditRequest: 'PENDING' },
            data: { adminEditRequest: 'NONE' },
            include: articleInclude,
        });
        res.json(transformArticleImage(req, article));
    } catch (error) {
        res.status(404).json({ error: 'Permintaan tidak ditemukan atau tidak dapat dibatalkan.' });
    }
};

export const respondToEditRequest = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    const { response } = req.body;
    const userId = req.user.userId;

    if (isNaN(articleId)) return res.status(400).json({ error: 'Invalid Article ID' });

    if (!response || !['APPROVED', 'DENIED'].includes(response)) {
        return res.status(400).json({ error: "Response must be 'APPROVED' or 'DENIED'." });
    }

    try {
        const article = await prisma.article.findUnique({ where: { id: articleId } });
        if (!article || article.authorId !== userId) {
            return res.status(403).json({ error: 'You are not the author of this article.' });
        }
        const updatedArticleFromDb = await prisma.article.update({
            where: { id: articleId },
            data: { adminEditRequest: response },
            include: articleInclude
        });
        res.json({ 
          message: `Edit request has been ${response.toLowerCase()}.`, 
          article: transformArticleImage(req, updatedArticleFromDb) 
        });
    } catch (error) {
        res.status(404).json({ error: 'Article not found.' });
    }
};

export const startRevision = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) return res.status(400).json({ error: 'Invalid Article ID' });

    const article = await prisma.article.findUnique({ where: { id: articleId }});

    if (!article || article.authorId !== req.user.userId) {
        return res.status(404).json({ error: 'Article not found or you are not the author' });
    }
    
    if (article.status !== 'NEEDS_REVISION') {
        return res.status(400).json({ error: 'Article is not in a state that needs revision.' });
    }

    const updatedArticleFromDb = await prisma.article.update({
        where: { id: articleId },
        data: { status: 'JOURNALIST_REVISING' },
        include: articleInclude
    });

    res.json({ 
      message: 'Article revision started', 
      article: transformArticleImage(req, updatedArticleFromDb) 
    });
};

export const finishRevision = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) return res.status(400).json({ error: 'Invalid Article ID' });

    const article = await prisma.article.findUnique({ where: { id: articleId }});

    if (!article || article.authorId !== req.user.userId) {
        return res.status(404).json({ error: 'Article not found or you are not the author' });
    }
    
    if (article.status !== 'JOURNALIST_REVISING') {
        return res.status(400).json({ error: 'Article is not currently being revised.' });
    }

    const updatedArticleFromDb = await prisma.article.update({
        where: { id: articleId },
        data: { status: 'REVISED' },
        include: articleInclude
    });

    res.json({ 
      message: 'Article revision finished', 
      article: transformArticleImage(req, updatedArticleFromDb) 
    });
};

export const revertAdminEditApproval = async (req, res) => {
    const { id } = req.params;
    try {
        const article = await prisma.article.update({
            where: { id: parseInt(id), adminEditRequest: 'APPROVED' },
            data: { adminEditRequest: 'NONE' },
            include: articleInclude,
        });
        res.json(transformArticleImage(req, article));
    } catch (error) {
        res.status(404).json({ error: 'Izin edit tidak ditemukan atau tidak dapat dibatalkan.' });
    }
};