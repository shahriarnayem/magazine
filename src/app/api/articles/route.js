import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { articleInputSchema, } from "@/lib/types";
import { uniqueSlug, stringifyTags, parseTags, excerptFromHtml, } from "@/lib/mag";
import { blocksJsonToHtml, emptyBlockNoteDoc, } from "@/lib/blocknote";
/* ----------------------------- PUBLIC LIST -------------------------------- */
export const GET = api(async (_ctx, req) => {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const tag = url.searchParams.get("tag");
    const q = url.searchParams.get("q");
    const featured = url.searchParams.get("featured");
    const sort = url.searchParams.get("sort") || "latest"; // latest | trending
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10", 10) || 10, 50);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const where = {
        status: "PUBLISHED",
        ...(category ? { category: { slug: category } } : {}),
        ...(featured === "true" ? { featured: true } : {}),
    };
    // Tag filtering must happen post-query because tags stored as JSON string
    let articles = await db.article.findMany({
        where,
        include: { category: true, author: { select: { name: true, image: true } } },
        orderBy: sort === "trending" ? { views: "desc" } : { publishedAt: "desc" },
        take: tag ? 50 : limit,
        skip: tag ? 0 : (page - 1) * limit,
    });
    if (tag) {
        articles = articles.filter((a) => parseTags(a.tags).includes(tag));
        const start = (page - 1) * limit;
        articles = articles.slice(start, start + limit);
    }
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
            publishedAt: a.publishedAt,
            createdAt: a.createdAt,
        })),
        page,
        limit,
    });
});
/* -------------------------------- CREATE ---------------------------------- */
export const POST = api(async (ctx, req) => {
    const body = await parseJson(req);
    const parsed = articleInputSchema.safeParse(body);
    if (!parsed.success) {
        return jsonError(parsed.error.issues[0]?.message || "Invalid input", 400);
    }
    const input = parsed.data;
    const author = ctx.user;
    const slug = await uniqueSlug(input.title, "article");
    // Prefer an explicit contentHtml (from the WYSIWYG editor). Fall back to
    // deriving HTML from BlockNote JSON (legacy / seeded content).
    const contentJson = input.contentJson || emptyBlockNoteDoc();
    const contentHtml = input.contentHtml && input.contentHtml.trim()
        ? input.contentHtml
        : blocksJsonToHtml(contentJson);
    const excerpt = input.excerpt && input.excerpt.trim()
        ? input.excerpt.trim()
        : excerptFromHtml(contentHtml);
    // Ensure category + tags exist
    let categoryId = input.categoryId || null;
    const article = await db.article.create({
        data: {
            title: input.title.trim(),
            slug,
            excerpt,
            contentJson,
            contentHtml,
            thumbnail: input.thumbnail || null,
            seoTitle: input.seoTitle || null,
            seoDescription: input.seoDescription || null,
            ogImage: input.ogImage || input.thumbnail || null,
            status: input.status,
            featured: input.featured,
            tags: stringifyTags(input.tags),
            authorId: author.id,
            authorName: author.name || author.email,
            categoryId,
            publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        },
    });
    // upsert tags
    await Promise.all(input.tags.map(async (t) => db.tag.upsert({
        where: { name: t },
        update: {},
        create: { name: t, slug: await uniqueSlug(t, "tag") },
    })));
    return jsonOk({ article }, 201);
}, { requireAuth: true, roles: ["ADMIN", "WRITER"] });
