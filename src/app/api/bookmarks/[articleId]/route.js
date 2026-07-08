import { db } from "@/lib/db";
import { api, jsonOk } from "@/lib/api";
/** Reader: check if a specific article is bookmarked + delete bookmark. */
export const GET = api(async (ctx, _req, params) => {
    const { articleId } = params;
    const existing = await db.bookmark.findUnique({
        where: { userId_articleId: { userId: ctx.user.id, articleId } },
    });
    return jsonOk({ bookmarked: !!existing });
}, { requireAuth: true });
export const DELETE = api(async (ctx, _req, params) => {
    const { articleId } = params;
    await db.bookmark
        .deleteMany({ where: { userId: ctx.user.id, articleId } })
        .catch(() => { });
    return jsonOk({ bookmarked: false });
}, { requireAuth: true });
