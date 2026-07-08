import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { parseTags, formatDate } from "@/lib/mag";
/** Reader: list bookmarked articles. */
export const GET = api(async (ctx) => {
    const bookmarks = await db.bookmark.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: "desc" },
        include: {
            article: {
                include: { category: true },
            },
        },
    });
    return jsonOk({
        bookmarks: bookmarks
            .filter((b) => b.article && b.article.status === "PUBLISHED")
            .map((b) => ({
            id: b.id,
            createdAt: b.createdAt,
            article: {
                id: b.article.id,
                title: b.article.title,
                slug: b.article.slug,
                excerpt: b.article.excerpt,
                thumbnail: b.article.thumbnail,
                tags: parseTags(b.article.tags),
                authorName: b.article.authorName,
                category: b.article.category
                    ? { name: b.article.category.name, slug: b.article.category.slug }
                    : null,
                publishedAt: b.article.publishedAt,
                publishedFormatted: formatDate(b.article.publishedAt || b.article.createdAt),
            },
        })),
    });
}, { requireAuth: true });
/** Reader: toggle bookmark for an article. */
export const POST = api(async (ctx, req) => {
    const { articleId } = await parseJson(req);
    if (!articleId)
        return jsonError("articleId required", 400);
    const article = await db.article.findUnique({ where: { id: articleId } });
    if (!article)
        return jsonError("Article not found", 404);
    const existing = await db.bookmark.findUnique({
        where: { userId_articleId: { userId: ctx.user.id, articleId } },
    });
    if (existing) {
        await db.bookmark.delete({ where: { id: existing.id } });
        return jsonOk({ bookmarked: false });
    }
    await db.bookmark.create({
        data: { userId: ctx.user.id, articleId },
    });
    return jsonOk({ bookmarked: true });
}, { requireAuth: true });
