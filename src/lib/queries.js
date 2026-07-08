/**
 * Shared server-side DB queries for public-facing pages.
 *
 * All functions return plain serializable objects (Dates converted to ISO strings)
 * so they can be passed from Server Components to Client Components as props.
 */
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseTags, excerptFromHtml } from "@/lib/mag";
export async function safeGetCurrentUser() {
    try {
        return await getCurrentUser();
    }
    catch {
        return null;
    }
}
function mapArticle(a) {
    return {
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt || excerptFromHtml(a.contentHtml),
        thumbnail: a.thumbnail,
        status: a.status,
        featured: a.featured,
        views: a.views,
        tags: parseTags(a.tags),
        authorName: a.authorName,
        authorImage: a.author?.image || null,
        category: a.category
            ? { id: a.category.id, name: a.category.name, slug: a.category.slug }
            : null,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
    };
}
export async function getPublishedArticles(opts = {}) {
    const limit = Math.min(opts.limit ?? 10, 50);
    const page = Math.max(opts.page ?? 1, 1);
    const sort = opts.sort ?? "latest";
    const where = { status: "PUBLISHED" };
    if (opts.categorySlug)
        where.category = { slug: opts.categorySlug };
    if (opts.featured)
        where.featured = true;
    if (opts.excludeId)
        where.id = { not: opts.excludeId };
    let articles = await db.article.findMany({
        where,
        include: { category: true, author: { select: { name: true, image: true, bio: true } } },
        orderBy: sort === "trending" ? { views: "desc" } : { publishedAt: "desc" },
        take: opts.tag || opts.q ? 50 : limit,
        skip: opts.tag || opts.q ? 0 : (page - 1) * limit,
    });
    if (opts.tag) {
        articles = articles.filter((a) => parseTags(a.tags).includes(opts.tag));
        const start = (page - 1) * limit;
        articles = articles.slice(start, start + limit);
    }
    if (opts.q) {
        const needle = opts.q.toLowerCase();
        articles = articles.filter((a) => a.title.toLowerCase().includes(needle) ||
            (a.excerpt || "").toLowerCase().includes(needle));
        if (!opts.tag) {
            const start = (page - 1) * limit;
            articles = articles.slice(start, start + limit);
        }
    }
    return { articles: articles.map(mapArticle), page, limit };
}
/* ---------------------------- featured ----------------------------------- */
export async function getFeaturedArticle() {
    const a = await db.article.findFirst({
        where: { status: "PUBLISHED", featured: true },
        include: {
            category: true,
            author: { select: { name: true, image: true, bio: true } },
        },
        orderBy: { publishedAt: "desc" },
    });
    if (a)
        return mapArticle(a);
    // fallback: latest published
    const latest = await db.article.findFirst({
        where: { status: "PUBLISHED" },
        include: {
            category: true,
            author: { select: { name: true, image: true, bio: true } },
        },
        orderBy: { publishedAt: "desc" },
    });
    return latest ? mapArticle(latest) : null;
}
/* --------------------------- trending ------------------------------------ */
export async function getTrendingArticles(limit = 5) {
    const articles = await db.article.findMany({
        where: { status: "PUBLISHED" },
        include: {
            category: true,
            author: { select: { name: true, image: true, bio: true } },
        },
        orderBy: { views: "desc" },
        take: limit,
    });
    return articles.map(mapArticle);
}
/* ------------------------- category helpers ------------------------------ */
export async function getCategoryBySlug(slug) {
    const c = await db.category.findUnique({
        where: { slug },
        include: { _count: { select: { articles: true } } },
    });
    if (!c)
        return null;
    return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        articleCount: c._count.articles,
    };
}
export async function getArticlesByCategory(slug, opts = {}) {
    const limit = Math.min(opts.limit ?? 9, 50);
    const page = Math.max(opts.page ?? 1, 1);
    const where = { status: "PUBLISHED", category: { slug } };
    const [total, articles] = await Promise.all([
        db.article.count({ where }),
        db.article.findMany({
            where,
            include: {
                category: true,
                author: { select: { name: true, image: true, bio: true } },
            },
            orderBy: { publishedAt: "desc" },
            take: limit,
            skip: (page - 1) * limit,
        }),
    ]);
    return { articles: articles.map(mapArticle), page, limit, total };
}
/* ------------------------- single article -------------------------------- */
export async function getArticleBySlug(slug) {
    const a = await db.article.findUnique({
        where: { slug },
        include: {
            category: true,
            author: { select: { name: true, image: true, bio: true } },
        },
    });
    if (!a || a.status !== "PUBLISHED")
        return null;
    const base = mapArticle(a);
    return {
        ...base,
        contentHtml: a.contentHtml || "",
        seoTitle: a.seoTitle,
        seoDescription: a.seoDescription,
        ogImage: a.ogImage || a.thumbnail,
        authorBio: a.author?.bio || null,
    };
}
export async function incrementViews(id) {
    await db.article
        .update({ where: { id }, data: { views: { increment: 1 } } })
        .catch(() => { });
}
/* ------------------------- related articles ------------------------------ */
export async function getRelatedArticles(article, limit = 3) {
    if (article.categoryId) {
        const sameCat = await db.article.findMany({
            where: {
                status: "PUBLISHED",
                categoryId: article.categoryId,
                id: { not: article.id },
            },
            include: {
                category: true,
                author: { select: { name: true, image: true, bio: true } },
            },
            orderBy: { publishedAt: "desc" },
            take: limit,
        });
        if (sameCat.length >= limit)
            return sameCat.map(mapArticle);
        // top up with other recent articles
        const need = limit - sameCat.length;
        const excludeIds = [article.id, ...sameCat.map((a) => a.id)];
        const extra = await db.article.findMany({
            where: { status: "PUBLISHED", id: { notIn: excludeIds } },
            include: {
                category: true,
                author: { select: { name: true, image: true, bio: true } },
            },
            orderBy: { publishedAt: "desc" },
            take: need,
        });
        return [...sameCat, ...extra].map(mapArticle);
    }
    // no category: just return latest
    const latest = await db.article.findMany({
        where: { status: "PUBLISHED", id: { not: article.id } },
        include: {
            category: true,
            author: { select: { name: true, image: true, bio: true } },
        },
        orderBy: { publishedAt: "desc" },
        take: limit,
    });
    return latest.map(mapArticle);
}
/* --------------------------- all categories ------------------------------ */
export async function getAllCategories() {
    const cats = await db.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { articles: true } } },
    });
    return cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        articleCount: c._count.articles,
    }));
}
/* ----------------------------- bookmarks --------------------------------- */
export async function getBookmarkedArticles(userId) {
    const bookmarks = await db.bookmark.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            article: {
                include: {
                    category: true,
                    author: { select: { name: true, image: true, bio: true } },
                },
            },
        },
    });
    return bookmarks
        .filter((b) => b.article && b.article.status === "PUBLISHED")
        .map((b) => ({
        id: b.id,
        createdAt: b.createdAt.toISOString(),
        article: mapArticle(b.article),
    }));
}
