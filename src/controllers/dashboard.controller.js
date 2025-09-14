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

        // 2. Ambil 5 artikel teratas berdasarkan viewCount
        const topArticles = await prisma.article.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { viewCount: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                viewCount: true,
                _count: {
                    select: { likes: true }
                }
            }
        });
        
        // 3. (Opsional) Data untuk Grafik - Ini adalah contoh sederhana.
        // Untuk data grafik yang kompleks dan terfilter (harian, bulanan),
        // biasanya memerlukan model/tabel terpisah untuk mencatat view/like per hari.
        // Query langsung dari tabel artikel bisa menjadi sangat berat jika datanya besar.
        // Di sini kita hanya akan mengirim total view dan like sebagai contoh awal.
        const totalPerformance = await prisma.article.aggregate({
            where: { status: 'PUBLISHED' },
            _sum: {
                viewCount: true,
            },
        });
        const totalLikes = await prisma.like.count();
        

        res.json({
            stats: {
                publishedArticles: publishedArticlesCount,
                journalistRequests: journalistRequestsCount,
                runningEvents: runningEventsCount,
            },
            performanceChart: { // Contoh data sederhana untuk grafik
                totalViews: totalPerformance._sum.viewCount || 0,
                totalLikes: totalLikes || 0,
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
            totalViews,
            totalLikes
        ] = await prisma.$transaction([
            prisma.article.count({ where: { authorId: userId, status: 'PUBLISHED' } }),
            prisma.article.count({ where: { authorId: userId, status: { in: ['NEEDS_REVISION', 'JOURNALIST_REVISING'] } } }),
            prisma.article.aggregate({
                where: { authorId: userId, status: 'PUBLISHED' },
                _sum: { viewCount: true }
            }),
            prisma.like.count({ where: { article: { authorId: userId } } })
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
                totalViews: totalViews._sum.viewCount || 0,
                totalLikes: totalLikes || 0,
            },
            performanceChart: { // Contoh data grafik sederhana
                 totalViews: totalViews._sum.viewCount || 0,
                 totalLikes: totalLikes || 0,
            },
            topArticles
        });
        
    } catch (error) {
        console.error("Get Journalist Dashboard Data Error:", error);
        res.status(500).json({ error: 'Failed to fetch journalist dashboard data.' });
    }
};