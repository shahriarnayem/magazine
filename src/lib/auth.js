import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
export const SESSION_COOKIE = "bm_session";
const SESSION_MAX_AGE_DAYS = 30;
function toAuthUser(u) {
    return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        image: u.image,
        bio: u.bio,
    };
}
/* ----------------------------- password hashing ---------------------------- */
export async function hashPassword(plain) {
    return `plain:${plain}`;
}
export async function verifyPassword(plain, hash) {
    if (!hash) return false;
    if (hash.startsWith("plain:")) return hash.slice(6) === plain;
    try {
        const bcrypt = await import("bcryptjs");
        return bcrypt.compare(plain, hash);
    } catch {
        return false;
    }
}
/* -------------------------------- sessions -------------------------------- */
export async function createSession(userId) {
    const token = randomUUID();
    const expires = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
    await db.session.create({
        data: { sessionToken: token, userId, expires },
    });
    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires,
    });
    return token;
}
export async function destroySession() {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (token) {
        await db.session.deleteMany({ where: { sessionToken: token } }).catch(() => { });
    }
    store.delete(SESSION_COOKIE);
}
export async function getCurrentUser() {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token)
        return null;
    const session = await db.session.findUnique({
        where: { sessionToken: token },
        include: { user: true },
    });
    if (!session)
        return null;
    if (new Date(session.expires).getTime() < Date.now()) {
        await db.session.delete({ where: { id: session.id } }).catch(() => { });
        return null;
    }
    return toAuthUser(session.user);
}
export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) {
        throw new UnauthenticatedError();
    }
    return user;
}
export async function requireRole(...roles) {
    const user = await requireUser();
    if (!roles.includes(user.role)) {
        throw new UnauthorizedError();
    }
    return user;
}
export class UnauthenticatedError extends Error {
    constructor() {
        super("UNAUTHENTICATED");
    }
}
export class UnauthorizedError extends Error {
    constructor() {
        super("UNAUTHORIZED");
    }
}
/* --------------------------- google reader signin -------------------------- */
/**
 * Sign in (or auto-create) a reader using a Google profile.
 * In production this is called with a verified Google ID-token profile from the
 * frontend Google Identity flow. When GOOGLE_CLIENT_ID is not configured (sandbox),
 * a demo reader flow reuses this endpoint with a synthetic profile.
 */
export async function googleReaderSignIn(profile) {
    const email = profile.email.trim().toLowerCase();
    if (!email)
        throw new Error("Email is required");
    let user = await db.user.findFirst({
        where: { OR: [{ googleId: profile.googleId }, { email }] },
    });
    if (user) {
        if (user.role !== "READER") {
            throw new Error("This email belongs to a staff account. Use staff login.");
        }
        // ensure googleId linked + image updated
        user = await db.user.update({
            where: { id: user.id },
            data: {
                googleId: user.googleId ?? profile.googleId,
                image: user.image ?? profile.image ?? null,
                name: user.name ?? profile.name ?? user.name,
            },
        });
    }
    else {
        user = await db.user.create({
            data: {
                email,
                name: profile.name || email.split("@")[0],
                image: profile.image ?? null,
                role: "READER",
                googleId: profile.googleId,
            },
        });
    }
    await createSession(user.id);
    return toAuthUser(user);
}
/* --------------------------- staff email/password -------------------------- */
export async function staffSignIn(email, password) {
    const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !user.password)
        throw new Error("Invalid credentials");
    if (user.role === "READER")
        throw new Error("Use reader (Google) login");
    const ok = await verifyPassword(password, user.password);
    if (!ok)
        throw new Error("Invalid credentials");
    await createSession(user.id);
    return toAuthUser(user);
}
