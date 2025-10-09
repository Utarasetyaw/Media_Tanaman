import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transformArticleImage = (req, article) => {
  if (article && article.imageUrl && article.imageUrl.startsWith('/')) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${protocol}://${req.get('host')}`;
    return { ...article, imageUrl: `${baseUrl}${article.imageUrl}` };
  }
  return article;
};

const transformArticleForResponse = (req, article) => {
  if (!article) return null;
  const articleWithImageUrl = transformArticleImage(req, article);
  return {
    ...articleWithImageUrl,
    _count: {
      likes: articleWithImageUrl.likeCount || 0
    }
  };
};

const articleInclude = {
  author: { select: { name: true, role: true } }, 
  category: { select: { id: true, name: true } },
  plantType: { select: { id: true, name: true } },
  seo: true,
};

export const createArticle = async (req, res) => {
  const { title, excerpt, content, categoryId, plantTypeId, seo, status: requestedStatus } = req.body;
  const authorId = req.user.userId;

  if (!title || !excerpt || !content || !categoryId) {
    return res.status(400).json({ error: 'Field yang wajib diisi belum lengkap.' });
  }

  const imageUrl = req.file ? `/uploads/artikel/${req.file.filename}` : '';

  if (!imageUrl && requestedStatus === 'PUBLISHED') {
      return res.status(400).json({ error: 'Gambar utama wajib diunggah untuk publikasi.' });
  }

  const userRole = req.user.role;
  let finalStatus = (userRole === 'ADMIN' && (requestedStatus === 'PUBLISHED' || requestedStatus === 'DRAFT')) ? requestedStatus : 'DRAFT';

  try {
    const data = {
      title: JSON.parse(title), 
      excerpt: JSON.parse(excerpt), 
      content: JSON.parse(content), 
      imageUrl,
      authorId, 
      status: finalStatus,
      categoryId: parseInt(categoryId),
      plantTypeId: plantTypeId ? parseInt(plantTypeId) : null,
      seo: userRole === 'ADMIN' && seo ? { create: JSON.parse(seo) } : undefined,
    };

    const articleFromDb = await prisma.article.create({ 
        data,
        include: articleInclude
    });
    res.status(201).json(transformArticleForResponse(req, articleFromDb));
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
  const articles = articlesFromDb.map(article => transformArticleForResponse(req, article));
  res.json(articles);
};

export const getMyArticleAnalytics = async (req, res) => {
  const { id } = req.params;
  const articleId = parseInt(id);
  const user = req.user;

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
    
    res.json(transformArticleForResponse(req, articleFromDb));
  } catch (error) {
    console.error("Error fetching article analytics:", error);
    res.status(500).json({ error: 'Could not fetch article analytics.' });
  }
};

export const updateArticle = async (req, res) => {
  const { id } = req.params;
  const articleId = parseInt(id);
  const { title, excerpt, content, categoryId, plantTypeId, seo } = req.body;
  const user = req.user;

  if (isNaN(articleId)) {
    return res.status(400).json({ error: 'Invalid Article ID' });
  }

  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article) return res.status(404).json({ error: 'Article not found' });

  const isOwner = article.authorId === user.userId;
  const isAdmin = user.role === 'ADMIN';

  const canAdminEdit = isAdmin && (article.authorId === user.userId || article.adminEditRequest === 'APPROVED' || article.status === 'PUBLISHED');
  
  const isJournalistEditableStatus = ['DRAFT', 'NEEDS_REVISION', 'JOURNALIST_REVISING'].includes(article.status);

  if (!canAdminEdit && !(isOwner && isJournalistEditableStatus)) {
      return res.status(403).json({ error: 'You do not have permission to edit this article at its current state.' });
  }
  
  const dataToUpdate = {};
  if (title) dataToUpdate.title = JSON.parse(title);
  if (excerpt) dataToUpdate.excerpt = JSON.parse(excerpt);
  if (content) dataToUpdate.content = JSON.parse(content);
  if (categoryId) dataToUpdate.categoryId = parseInt(categoryId);
  if (plantTypeId !== undefined) dataToUpdate.plantTypeId = plantTypeId ? parseInt(plantTypeId) : null;
  
  if (req.file) {
      dataToUpdate.imageUrl = `/uploads/artikel/${req.file.filename}`;
  }

  if (seo) {
    dataToUpdate.seo = {
      upsert: {
        create: seo,
        update: seo,
      },
    };
  }

  try {
    if (req.file && article.imageUrl && !article.imageUrl.startsWith('http')) {
        const oldImagePath = path.join(__dirname, '../../public', article.imageUrl);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }
    
    const updatedArticleFromDb = await prisma.article.update({
      where: { id: articleId },
      data: dataToUpdate,
      include: articleInclude
    });
    res.json(transformArticleForResponse(req, updatedArticleFromDb));
  } catch (error) {
    console.error("Update article error:", error);
    res.status(500).json({ error: 'Could not update article.' });
  }
};

export const deleteMyArticle = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    const userId = req.user.userId;
    if (isNaN(articleId)) return res.status(400).json({ error: 'Invalid Article ID' });
    try {
        const article = await prisma.article.findUnique({ where: { id: articleId } });
        if (!article) return res.status(404).json({ error: 'Article not found' });
        if (article.authorId !== userId) return res.status(403).json({ error: 'You are not authorized to delete this article.' });
        const deletableStatuses = ['DRAFT', 'REJECTED', 'NEEDS_REVISION', 'PUBLISHED'];
        if (!deletableStatuses.includes(article.status)) return res.status(403).json({ error: `Cannot delete article with status '${article.status}'.` });
        if (article.imageUrl && !article.imageUrl.startsWith('http')) {
            const imagePath = path.join(__dirname, '../../public', article.imageUrl);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
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
    if (!article || article.authorId !== req.user.userId) return res.status(404).json({ error: 'Article not found or you are not the author' });
    if (!article.imageUrl) return res.status(400).json({ error: 'An article must have a main image before being submitted for review.' });
    if (!['DRAFT', 'NEEDS_REVISION', 'REVISED'].includes(article.status)) return res.status(400).json({ error: 'Only drafts or revised articles can be submitted' });
    
    const updatedArticleFromDb = await prisma.article.update({
        where: { id: articleId },
        data: { status: 'IN_REVIEW' },
        include: articleInclude
    });

    res.json({ 
      message: 'Article submitted for review', 
      article: transformArticleForResponse(req, updatedArticleFromDb) 
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
    const draft = await prisma.article.count({ where: { authorId, status: 'DRAFT' } });

    const recentArticlesFromDb = await prisma.article.findMany({
      where: { authorId },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: articleInclude
    });

    const recentArticles = recentArticlesFromDb.map(article => transformArticleForResponse(req, article));

    res.json({
      stats: { published, inReview, needsRevision, adminRequest, rejected, draft },
      recentArticles,
    });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch journalist dashboard stats.' });
  }
};


export const getAllArticlesForAdmin = async (req, res) => {
  try {
    const articlesFromDb = await prisma.article.findMany({
      include: articleInclude,
      orderBy: { updatedAt: 'desc' },
    });
    const articles = articlesFromDb.map(article => transformArticleForResponse(req, article));
    res.json(articles);
  } catch (error) {
    console.error("Get all articles for admin error:", error);
    res.status(500).json({ error: 'Could not fetch articles.' });
  }
};

export const updateArticleStatus = async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    const { status, feedback } = req.body;
    if (isNaN(articleId)) return res.status(400).json({ error: 'Invalid Article ID' });
    const validStatuses = ['PUBLISHED', 'NEEDS_REVISION', 'REJECTED'];
    if (!status || !validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status provided for an admin action.' });
    try {
        const updatedArticleFromDb = await prisma.article.update({
            where: { id: articleId },
            data: { status, feedback: feedback || null, adminEditRequest: status === 'PUBLISHED' ? 'NONE' : undefined },
            include: articleInclude
        });
        res.json({ 
          message: `Article status updated to ${status}`,
          article: transformArticleForResponse(req, updatedArticleFromDb) 
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
            const imagePath = path.join(__dirname, '../../public', article.imageUrl);
             if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
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
        const recentActivity = recentActivityFromDb.map(act => transformArticleForResponse(req, act));
        res.json({
            stats: { totalPublished, journalistRequests, needsRevision, adminEditPending, totalRejected },
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch admin dashboard stats.' });
    }
};

const genericArticleUpdate = async (req, res, where, data, successMessage) => {
    try {
        const articleFromDb = await prisma.article.update({
            where,
            data,
            include: articleInclude,
        });
        res.json({ 
          message: successMessage, 
          article: transformArticleForResponse(req, articleFromDb) 
        });
    } catch (error) {
        res.status(404).json({ error: 'Article not found or action is not permitted.' });
    }
};

export const requestEditAccess = (req, res) => genericArticleUpdate(req, res, { id: parseInt(req.params.id) }, { adminEditRequest: 'PENDING' }, 'Edit access requested.');
export const cancelAdminEditRequest = (req, res) => genericArticleUpdate(req, res, { id: parseInt(req.params.id), adminEditRequest: 'PENDING' }, { adminEditRequest: 'NONE' }, 'Edit request cancelled.');
export const respondToEditRequest = (req, res) => {
    const { response } = req.body;
    if (!['APPROVED', 'DENIED'].includes(response)) return res.status(400).json({ error: "Response must be 'APPROVED' or 'DENIED'." });
    return genericArticleUpdate(req, res, { id: parseInt(req.params.id), authorId: req.user.userId }, { adminEditRequest: response }, `Edit request has been ${response.toLowerCase()}.`);
};
export const startRevision = (req, res) => genericArticleUpdate(req, res, { id: parseInt(req.params.id), authorId: req.user.userId, status: 'NEEDS_REVISION' }, { status: 'JOURNALIST_REVISING' }, 'Article revision started');
export const finishRevision = (req, res) => genericArticleUpdate(req, res, { id: parseInt(req.params.id), authorId: req.user.userId, status: 'JOURNALIST_REVISING' }, { status: 'REVISED' }, 'Article revision finished');
export const revertAdminEditApproval = (req, res) => genericArticleUpdate(req, res, { id: parseInt(req.params.id), adminEditRequest: 'APPROVED' }, { adminEditRequest: 'NONE' }, 'Edit approval reverted.');