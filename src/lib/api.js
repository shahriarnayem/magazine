import { NextResponse } from "next/server";
import { UnauthenticatedError, UnauthorizedError, getCurrentUser, } from "@/lib/auth";
export function jsonOk(data, status = 200) {
    return NextResponse.json(data, { status });
}
export function jsonError(message, status = 400) {
    return NextResponse.json({ error: message }, { status });
}
/**
 * Wraps an API handler with auth context + consistent error handling.
 * Pass `requireAuth: true` to enforce a logged-in user, or `roles` to enforce roles.
 */
export function api(fn, opts = {}) {
    return async (req, ctx = {}) => {
        try {
            const user = await getCurrentUser();
            if (opts.requireAuth && !user)
                throw new UnauthenticatedError();
            if (opts.roles && user && !opts.roles.includes(user.role)) {
                throw new UnauthorizedError();
            }
            const params = ctx.params ? await ctx.params : {};
            return await fn({ user }, req, params);
        }
        catch (e) {
            const err = e;
            if (err instanceof UnauthenticatedError || err.message === "UNAUTHENTICATED") {
                return jsonError("Authentication required", 401);
            }
            if (err instanceof UnauthorizedError || err.message === "UNAUTHORIZED") {
                return jsonError("You don't have permission to do that", 403);
            }
            const msg = err.message || "Internal server error";
            const status = msg.includes("required") ? 400 : 500;
            if (status >= 500)
                console.error("[api error]", err);
            return jsonError(msg, status);
        }
    };
}
/** Parse JSON body safely. */
export async function parseJson(req) {
    const text = await req.text();
    if (!text)
        return {};
    return JSON.parse(text);
}
