import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { categoryInputSchema } from "@/lib/types";
import { uniqueSlug } from "@/lib/mag";
export const GET = api(async () => {
    const categories = await db.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { articles: true } } },
    });
    return jsonOk({
        categories: categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            articleCount: c._count.articles,
            createdAt: c.createdAt,
        })),
    });
});
export const POST = api(async (_ctx, req) => {
    const body = await parseJson(req);
    const parsed = categoryInputSchema.safeParse(body);
    if (!parsed.success) {
        return jsonError(parsed.error.issues[0]?.message || "Invalid input", 400);
    }
    const slug = await uniqueSlug(parsed.data.name, "category");
    const category = await db.category.create({
        data: {
            name: parsed.data.name.trim(),
            slug,
            description: parsed.data.description || null,
        },
    });
    return jsonOk({ category }, 201);
}, { requireAuth: true, roles: ["ADMIN"] });
