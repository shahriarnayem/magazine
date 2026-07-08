import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { googleReaderSignIn } from "@/lib/auth";
/**
 * Reader Google sign-in.
 *
 * Production: the frontend uses Google Identity Services to obtain an ID token
 * (`credential`) and sends it here. When GOOGLE_CLIENT_ID is set we verify the
 * token via Google's tokeninfo endpoint and extract the profile.
 *
 * Sandbox (no Google creds): we accept a profile {email,name,image,googleId}
 * directly so the reader flow is testable. This is clearly gated behind the
 * absence of GOOGLE_CLIENT_ID.
 */
export const POST = api(async (_ctx, req) => {
    const body = await parseJson(req);
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (googleClientId && body.credential) {
        // Verify ID token with Google
        const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`);
        if (!resp.ok)
            return jsonError("Invalid Google token", 401);
        const payload = (await resp.json());
        if (payload.aud !== googleClientId)
            return jsonError("Token audience mismatch", 401);
        if (payload.email_verified !== "true" || !payload.email) {
            return jsonError("Google email not verified", 401);
        }
        const user = await googleReaderSignIn({
            email: payload.email,
            name: payload.name,
            image: payload.picture,
            googleId: payload.sub || payload.email,
        });
        return jsonOk({ user });
    }
    // Demo / fallback profile flow (sandbox only)
    if (!body.email || !body.googleId) {
        return jsonError("Email is required", 400);
    }
    const user = await googleReaderSignIn({
        email: body.email,
        name: body.name,
        image: body.image,
        googleId: body.googleId,
    });
    return jsonOk({ user });
});
