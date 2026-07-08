import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { relativeTime } from "@/lib/mag";
/** Admin: list all comments (optionally filtered by status) for moderation. */
export const GET = api(async (ctx, req) => {
    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // PENDING | APPROVED | REJECTED
    const where = status ? { status } : {};
    const comments = await db.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { article: { select: { title: true, slug: true } } },
    });
    return jsonOk({
        comments: comments.map((c) => ({
            id: c.id,
            content: c.content,
            status: c.status,
            userName: c.userName,
            userImage: c.userImage,
            createdAt: c.createdAt,
            relativeTime: relativeTime(c.createdAt),
            article: c.article
                ? { title: c.article.title, slug: c.article.slug }
                : null,
        })),
    });
}, { requireAuth: true, roles: ["ADMIN"] });
export const PUT = api(async (_ctx, req, params) => {
    const { id } = params;
    const body = await parseJson(req);
    if (!["PENDING", "APPROVED", "REJECTED"].includes(body.status)) {
        return jsonError("Invalid status", 400);
    }
    const existing = await db.comment.findUnique({ where: { id } });
    if (!existing)
        return jsonError("Comment not found", 404);
    const comment = await db.comment.update({
        where: { id },
        data: { status: body.status },
    });
    return jsonOk({ comment });
}, { requireAuth: true, roles: ["ADMIN"] });
export const DELETE = api(async (_ctx, _req, params) => {
    const { id } = params;
    const existing = await db.comment.findUnique({ where: { id } });
    if (!existing)
        return jsonError("Comment not found", 404);
    await db.comment.delete({ where: { id } });
    return jsonOk({ ok: true });
}, { requireAuth: true, roles: ["ADMIN"] });
