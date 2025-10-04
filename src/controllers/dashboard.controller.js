import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mengambil data untuk Dashboard Admin.
 */
export const getAdminDashboardData = async (req, res) => {
    try {
        // 1. Ambil data statistik utama (widgets)
        const [
            publishedArticlesCount,
            journalistRequestsCount,
            runningEventsCount
        ] = await prisma.$transaction([
            prisma.article.count({ where: { status: 'PUBLISHED' } }),
            prisma.article.count({ where: { status: 'IN_REVIEW' } }),
            prisma.event.count({
                where: {
                    endDate: { gte: new Date() }, // gte = greater than or equal to
                    startDate: { lte: new Date() }  // lte = less than or equal to
                }
            })
        ]);

        // ▼▼▼ PERUBAHAN DI SINI ▼▼▼

        // 2. Ambil 5 artikel teratas, ganti _count dengan likeCount dari skema
        const topArticlesFromDb = await prisma.article.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { viewCount: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                viewCount: true,
                likeCount: true // Ambil field 'likeCount' yang sebenarnya ada di skema
            }
        });

        // 3. Ubah (transformasi) data agar cocok dengan format yang diharapkan frontend
        const topArticles = topArticlesFromDb.map(article => ({
            id: article.id,
            title: article.title,
            viewCount: article.viewCount,
            _count: {
                likes: article.likeCount // Buat objek _count secara manual
            }
        }));
        
        // ▲▲▲ AKHIR PERUBAHAN ▲▲▲

        // 4. Data untuk Grafik
        const totalPerformance = await prisma.article.aggregate({
            where: { status: 'PUBLISHED' },
            _sum: {
                viewCount: true,
            },
        });
        // Note: `prisma.like.count()` akan error jika model `Like` tidak ada.
        // Jika Anda tidak punya model `Like`, Anda bisa menjumlahkan `likeCount`
        const totalLikesAggregation = await prisma.article.aggregate({
            _sum: {
                likeCount: true,
            }
        });
        
        res.json({
            stats: {
                publishedArticles: publishedArticlesCount,
                journalistRequests: journalistRequestsCount,
                runningEvents: runningEventsCount,
            },
            performanceChart: {
                totalViews: totalPerformance._sum.viewCount || 0,
                totalLikes: totalLikesAggregation._sum.likeCount || 0,
            },
            topArticles,
        });

    } catch (error) {
        console.error("Get Admin Dashboard Data Error:", error);
        res.status(500).json({ error: 'Failed to fetch admin dashboard data.' });
    }
};


/**
 * Mengambil data untuk Dashboard Jurnalis.
 */
export const getJournalistDashboardData = async (req, res) => {
    const userId = req.user.userId;

    try {
        // 1. Ambil data statistik utama (widgets)
        const [
            publishedCount,
            needsRevisionCount,
            totalViewsAggregation, // Diubah nama agar lebih jelas
            totalLikesAggregation  // Diubah nama agar lebih jelas
        ] = await prisma.$transaction([
            prisma.article.count({ where: { authorId: userId, status: 'PUBLISHED' } }),
            prisma.article.count({ where: { authorId: userId, status: { in: ['NEEDS_REVISION', 'JOURNALIST_REVISING'] } } }),
            prisma.article.aggregate({
                where: { authorId: userId, status: 'PUBLISHED' },
                _sum: { viewCount: true }
            }),
            // Menggunakan agregasi dari likeCount, bukan dari model Like yang mungkin tidak ada
            prisma.article.aggregate({
                where: { authorId: userId },
                _sum: { likeCount: true }
            })
        ]);

        // 2. Ambil 5 artikel teratas milik jurnalis ini
        const topArticles = await prisma.article.findMany({
            where: { authorId: userId, status: 'PUBLISHED' },
            orderBy: { viewCount: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                viewCount: true,
            }
        });
        
        res.json({
            stats: {
                published: publishedCount,
                needsRevision: needsRevisionCount,
                totalViews: totalViewsAggregation._sum.viewCount || 0,
                totalLikes: totalLikesAggregation._sum.likeCount || 0,
            },
            performanceChart: {
                 totalViews: totalViewsAggregation._sum.viewCount || 0,
                 totalLikes: totalLikesAggregation._sum.likeCount || 0,
            },
            topArticles
        });
        
    } catch (error) {
        console.error("Get Journalist Dashboard Data Error:", error);
        res.status(500).json({ error: 'Failed to fetch journalist dashboard data.' });
    }
};