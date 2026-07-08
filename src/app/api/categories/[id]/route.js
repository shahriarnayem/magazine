import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { categoryInputSchema } from "@/lib/types";
import { uniqueSlug } from "@/lib/mag";
export const PUT = api(async (_ctx, req, params) => {
    const { id } = params;
    const body = await parseJson(req);
    const parsed = categoryInputSchema.safeParse(body);
    if (!parsed.success) {
        return jsonError(parsed.error.issues[0]?.message || "Invalid input", 400);
    }
    const existing = await db.category.findUnique({ where: { id } });
    if (!existing)
        return jsonError("Category not found", 404);
    const slug = parsed.data.name.trim() === existing.name
        ? existing.slug
        : await uniqueSlug(parsed.data.name, "category", id);
    const category = await db.category.update({
        where: { id },
        data: {
            name: parsed.data.name.trim(),
            slug,
            description: parsed.data.description || null,
        },
    });
    return jsonOk({ category });
}, { requireAuth: true, roles: ["ADMIN"] });
export const DELETE = api(async (_ctx, _req, params) => {
    const { id } = params;
    const existing = await db.category.findUnique({ where: { id } });
    if (!existing)
        return jsonError("Category not found", 404);
    // detach articles (categoryId set null via schema onDelete: SetNull)
    await db.category.delete({ where: { id } });
    return jsonOk({ ok: true });
}, { requireAuth: true, roles: ["ADMIN"] });
