import { db } from "@/lib/db";
import { api, jsonOk } from "@/lib/api";
import { formatDate } from "@/lib/mag";
/** Admin dashboard stats. */
export const GET = api(async () => {
    const [totalArticles, publishedArticles, draftArticles, totalUsers, readers, writers, pendingComments, totalComments, categories, totalViewsAgg,] = await Promise.all([
        db.article.count(),
        db.article.count({ where: { status: "PUBLISHED" } }),
        db.article.count({ where: { status: "DRAFT" } }),
        db.user.count(),
        db.user.count({ where: { role: "READER" } }),
        db.user.count({ where: { role: "WRITER" } }),
        db.comment.count({ where: { status: "PENDING" } }),
        db.comment.count(),
        db.category.count(),
        db.article.aggregate({ _sum: { views: true } }),
    ]);
    const recentArticles = await db.article.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            views: true,
            authorName: true,
            createdAt: true,
        },
    });
    const topArticles = await db.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { views: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, views: true },
    });
    return jsonOk({
        counts: {
            totalArticles,
            publishedArticles,
            draftArticles,
            totalUsers,
            readers,
            writers,
            pendingComments,
            totalComments,
            categories,
            totalViews: totalViewsAgg._sum.views || 0,
        },
        recentArticles: recentArticles.map((a) => ({
            ...a,
            createdFormatted: formatDate(a.createdAt),
        })),
        topArticles,
    });
}, { requireAuth: true, roles: ["ADMIN"] });
