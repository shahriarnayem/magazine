import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { articleInputSchema } from "@/lib/types";
import { uniqueSlug, stringifyTags, parseTags, excerptFromHtml, } from "@/lib/mag";
import { blocksJsonToHtml } from "@/lib/blocknote";
/* ------------------------ GET single (dashboard edit) --------------------- */
export const GET = api(async (ctx, _req, params) => {
    const { id } = params;
    const article = await db.article.findUnique({
        where: { id },
        include: { category: true },
    });
    if (!article)
        return jsonError("Article not found", 404);
    // Writers can only access their own; admins any
    if (ctx.user.role === "WRITER" && article.authorId !== ctx.user.id) {
        return jsonError("Not allowed", 403);
    }
    return jsonOk({
        article: {
            ...article,
            tags: parseTags(article.tags),
            category: article.category
                ? { id: article.category.id, name: article.category.name, slug: article.category.slug }
                : null,
        },
    });
}, { requireAuth: true, roles: ["ADMIN", "WRITER"] });
/* ----------------------------- UPDATE (same doc) -------------------------- */
export const PUT = api(async (ctx, req, params) => {
    const { id } = params;
    const existing = await db.article.findUnique({ where: { id } });
    if (!existing)
        return jsonError("Article not found", 404);
    if (ctx.user.role === "WRITER" && existing.authorId !== ctx.user.id) {
        return jsonError("Not allowed", 403);
    }
    const body = await parseJson(req);
    const parsed = articleInputSchema.safeParse(body);
    if (!parsed.success) {
        return jsonError(parsed.error.issues[0]?.message || "Invalid input", 400);
    }
    const input = parsed.data;
    // Re-slug only if title changed and slug would differ
    let slug = existing.slug;
    if (input.title.trim() !== existing.title) {
        const newSlug = await uniqueSlug(input.title, "article", id);
        slug = newSlug;
    }
    const contentJson = input.contentJson ?? existing.contentJson;
    // Prefer an explicit contentHtml (from the WYSIWYG editor). Otherwise keep
    // the existing HTML, or re-derive it if only contentJson changed.
    const contentHtml = input.contentHtml && input.contentHtml.trim()
        ? input.contentHtml
        : input.contentJson
            ? blocksJsonToHtml(contentJson)
            : existing.contentHtml;
    const excerpt = input.excerpt && input.excerpt.trim()
        ? input.excerpt.trim()
        : excerptFromHtml(contentHtml);
    const wasPublished = existing.status === "PUBLISHED";
    const nowPublished = input.status === "PUBLISHED";
    // UPDATE the same document — never create a new one
    const updated = await db.article.update({
        where: { id },
        data: {
            title: input.title.trim(),
            slug,
            excerpt,
            contentJson,
            contentHtml,
            thumbnail: input.thumbnail ?? null,
            seoTitle: input.seoTitle ?? null,
            seoDescription: input.seoDescription ?? null,
            ogImage: input.ogImage || input.thumbnail || null,
            status: input.status,
            featured: input.featured,
            tags: stringifyTags(input.tags),
            categoryId: input.categoryId || null,
            publishedAt: !wasPublished && nowPublished ? new Date() : existing.publishedAt,
        },
    });
    // upsert tags
    await Promise.all(input.tags.map(async (t) => db.tag.upsert({
        where: { name: t },
        update: {},
        create: { name: t, slug: await uniqueSlug(t, "tag") },
    })));
    return jsonOk({ article: { ...updated, tags: parseTags(updated.tags) } });
}, { requireAuth: true, roles: ["ADMIN", "WRITER"] });
/* --------------------------------- DELETE --------------------------------- */
export const DELETE = api(async (ctx, _req, params) => {
    const { id } = params;
    const existing = await db.article.findUnique({ where: { id } });
    if (!existing)
        return jsonError("Article not found", 404);
    if (ctx.user.role === "WRITER" && existing.authorId !== ctx.user.id) {
        return jsonError("Not allowed", 403);
    }
    await db.article.delete({ where: { id } });
    return jsonOk({ ok: true });
}, { requireAuth: true, roles: ["ADMIN", "WRITER"] });
