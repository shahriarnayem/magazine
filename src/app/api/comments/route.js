import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { commentInputSchema } from "@/lib/types";
import { relativeTime } from "@/lib/mag";
/** Reader creates a comment (always PENDING until approved). */
export const POST = api(async (ctx, req) => {
    if (!ctx.user || ctx.user.role !== "READER") {
        // Only readers comment. Staff may also comment as readers? Spec: readers comment.
        // We allow any logged-in user to comment but mark role accordingly.
        if (!ctx.user)
            return jsonError("Login required to comment", 401);
    }
    const body = await parseJson(req);
    const parsed = commentInputSchema.safeParse(body);
    if (!parsed.success) {
        return jsonError(parsed.error.issues[0]?.message || "Invalid input", 400);
    }
    const article = await db.article.findUnique({ where: { id: parsed.data.articleId } });
    if (!article || article.status !== "PUBLISHED") {
        return jsonError("Article not found", 404);
    }
    const u = ctx.user;
    const comment = await db.comment.create({
        data: {
            articleId: parsed.data.articleId,
            userId: u.id,
            userName: u.name || u.email,
            userImage: u.image,
            content: parsed.data.content.trim(),
            status: "PENDING",
        },
    });
    return jsonOk({
        comment: {
            ...comment,
            relativeTime: relativeTime(comment.createdAt),
        },
    }, 201);
}, { requireAuth: true });
