import { db } from "@/lib/db";
import { api, jsonOk } from "@/lib/api";
import { relativeTime } from "@/lib/mag";
/** Public: list APPROVED comments for an article. */
export const GET = api(async (_ctx, _req, params) => {
    const { articleId } = params;
    const comments = await db.comment.findMany({
        where: { articleId, status: "APPROVED" },
        orderBy: { createdAt: "asc" },
        take: 200,
    });
    return jsonOk({
        comments: comments.map((c) => ({
            id: c.id,
            userName: c.userName,
            userImage: c.userImage,
            content: c.content,
            createdAt: c.createdAt,
            relativeTime: relativeTime(c.createdAt),
        })),
    });
});
