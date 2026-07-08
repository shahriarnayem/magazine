import { db } from "@/lib/db";
import { api, jsonOk } from "@/lib/api";
import { parseTags, formatDate } from "@/lib/mag";
/** Dashboard article list. Admin sees all, Writer sees only own. */
export const GET = api(async (ctx, req) => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q");
    const role = ctx.user.role;
    const where = {
        ...(role === "WRITER" ? { authorId: ctx.user.id } : {}),
        ...(status ? { status } : {}),
    };
    let articles = await db.article.findMany({
        where,
        include: { category: true },
        orderBy: { updatedAt: "desc" },
        take: 200,
    });
    if (q) {
        const needle = q.toLowerCase();
        articles = articles.filter((a) => a.title.toLowerCase().includes(needle) ||
            (a.excerpt || "").toLowerCase().includes(needle));
    }
    return jsonOk({
        articles: articles.map((a) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            status: a.status,
            featured: a.featured,
            views: a.views,
            thumbnail: a.thumbnail,
            tags: parseTags(a.tags),
            authorName: a.authorName,
            authorId: a.authorId,
            category: a.category
                ? { id: a.category.id, name: a.category.name, slug: a.category.slug }
                : null,
            updatedAt: a.updatedAt,
            publishedAt: a.publishedAt,
            createdAt: a.createdAt,
            updatedFormatted: formatDate(a.updatedAt, {
                month: "short",
                day: "numeric",
                year: "numeric",
            }),
        })),
    });
}, { requireAuth: true, roles: ["ADMIN", "WRITER"] });
