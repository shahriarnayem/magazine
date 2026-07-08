import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";
export const PUT = api(async (_ctx, req, params) => {
    const { id } = params;
    const body = await parseJson(req);
    const existing = await db.user.findUnique({ where: { id } });
    if (!existing)
        return jsonError("User not found", 404);
    if (existing.role === "READER")
        return jsonError("Cannot edit reader here", 400);
    const schema = z.object({
        name: z.string().min(1).max(80),
        email: z.string().email(),
        role: z.enum(["ADMIN", "WRITER"]),
        bio: z.string().max(500).optional().nullable(),
        password: z.string().min(8).optional().or(z.literal("")),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success)
        return jsonError(parsed.error.issues[0]?.message || "Invalid", 400);
    const d = parsed.data;
    const email = d.email.trim().toLowerCase();
    if (email !== existing.email) {
        const clash = await db.user.findUnique({ where: { email } });
        if (clash)
            return jsonError("Email already in use", 400);
    }
    const data = {
        name: d.name.trim(),
        email,
        role: d.role,
        bio: d.bio || null,
    };
    if (d.password && d.password.length >= 8) {
        data.password = await hashPassword(d.password);
    }
    const user = await db.user.update({ where: { id }, data });
    return jsonOk({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}, { requireAuth: true, roles: ["ADMIN"] });
export const DELETE = api(async (ctx, _req, params) => {
    const { id } = params;
    if (id === ctx.user.id)
        return jsonError("You cannot delete your own account", 400);
    const existing = await db.user.findUnique({ where: { id } });
    if (!existing)
        return jsonError("User not found", 404);
    if (existing.role === "READER")
        return jsonError("Cannot delete reader here", 400);
    await db.user.delete({ where: { id } });
    return jsonOk({ ok: true });
}, { requireAuth: true, roles: ["ADMIN"] });
