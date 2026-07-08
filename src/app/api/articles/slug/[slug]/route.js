import { db } from "@/lib/db";
import { api, jsonOk, jsonError } from "@/lib/api";
import { parseTags, formatDate } from "@/lib/mag";
/**
 * Public single article by slug. Increments views and returns only published
 * articles. Drafts/archived are not exposed here.
 */
export const GET = api(async (_ctx, _req, params) => {
    const { slug } = params;
    const article = await db.article.findUnique({
        where: { slug },
        include: {
            category: true,
            author: { select: { name: true, image: true, bio: true } },
        },
    });
    if (!article || article.status !== "PUBLISHED") {
        return jsonError("Article not found", 404);
    }
    // increment views (fire and forget)
    await db.article
        .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
        .catch(() => { });
    return jsonOk({
        article: {
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            contentHtml: article.contentHtml,
            thumbnail: article.thumbnail,
            seoTitle: article.seoTitle,
            seoDescription: article.seoDescription,
            ogImage: article.ogImage || article.thumbnail,
            featured: article.featured,
            views: article.views + 1,
            tags: parseTags(article.tags),
            authorName: article.authorName,
            authorImage: article.author?.image || null,
            authorBio: article.author?.bio || null,
            category: article.category
                ? { id: article.category.id, name: article.category.name, slug: article.category.slug }
                : null,
            publishedAt: article.publishedAt,
            createdAt: article.createdAt,
            publishedAtFormatted: formatDate(article.publishedAt || article.createdAt, {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        },
    });
});
