import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { profileInputSchema } from "@/lib/types";
export const PUT = api(async (ctx, req) => {
    const body = await parseJson(req);
    const parsed = profileInputSchema.safeParse(body);
    if (!parsed.success) {
        return jsonError(parsed.error.issues[0]?.message || "Invalid input", 400);
    }
    const d = parsed.data;
    const data = {};
    if (d.name !== undefined)
        data.name = d.name.trim();
    if (d.bio !== undefined)
        data.bio = d.bio || null;
    if (d.image !== undefined)
        data.image = d.image || null;
    const user = await db.user.update({ where: { id: ctx.user.id }, data });
    return jsonOk({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            bio: user.bio,
        },
    });
}, { requireAuth: true });
