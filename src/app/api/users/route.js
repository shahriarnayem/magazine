import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { userInputSchema } from "@/lib/types";
import { hashPassword } from "@/lib/auth";
import { formatDate } from "@/lib/mag";
/** Admin user list (staff only — readers excluded from management view by default). */
export const GET = api(async (ctx, req) => {
    const url = new URL(req.url);
    const includeReaders = url.searchParams.get("readers") === "true";
    const where = includeReaders ? {} : { role: { in: ["ADMIN", "WRITER"] } };
    const users = await db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            image: true,
            bio: true,
            createdAt: true,
            _count: { select: { articles: true } },
        },
    });
    return jsonOk({
        users: users.map((u) => ({
            ...u,
            articleCount: u._count.articles,
            createdFormatted: formatDate(u.createdAt),
        })),
        currentUserId: ctx.user.id,
    });
}, { requireAuth: true, roles: ["ADMIN"] });
/** Admin creates a new writer (or admin). */
export const POST = api(async (_ctx, req) => {
    const body = await parseJson(req);
    const parsed = userInputSchema.safeParse(body);
    if (!parsed.success) {
        return jsonError(parsed.error.issues[0]?.message || "Invalid input", 400);
    }
    const input = parsed.data;
    const email = input.email.trim().toLowerCase();
    const exists = await db.user.findUnique({ where: { email } });
    if (exists)
        return jsonError("Email already in use", 400);
    const password = await hashPassword(input.password);
    const user = await db.user.create({
        data: {
            email,
            name: input.name.trim(),
            password,
            role: input.role,
            bio: input.bio || null,
        },
    });
    return jsonOk({
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, 201);
}, { requireAuth: true, roles: ["ADMIN"] });
