import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js'; // Pastikan path ini benar

// Impor semua fungsi dari satu controller terpadu
import { 
    getLayoutData, 
    getHomePageData, 
    searchSite,
    getArticles, 
    getArticleById, 
    toggleArticleLike,
    getPlants, 
    getPlantById,
    getEvents, 
    getEventById, 
    trackEventClick,
    getAboutPageData
} from '../controllers/page.controller.js';

const router = Router();

// Rute Halaman & Layout
router.get('/layout', getLayoutData);
router.get('/home', getHomePageData);
router.get('/about', getAboutPageData);


// Rute Pencarian
router.get('/search', searchSite);

// Rute Artikel (Publik)
router.get('/articles', getArticles);
router.get('/articles/:id', getArticleById);
router.post('/articles/:id/like', authenticateToken, toggleArticleLike);

// Rute Tanaman (Publik)
router.get('/plants', getPlants);
router.get('/plants/:id', getPlantById);

// Rute Event (Publik)
router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.post('/events/:id/track-click', trackEventClick);

export default router;