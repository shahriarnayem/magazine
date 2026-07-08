import { db } from "@/lib/db";
import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { isCloudinaryConfigured, uploadToCloudinary, normalizeImageUrl, } from "@/lib/cloudinary";
/**
 * Image upload endpoint.
 * - Accepts JSON: { url } (remote image URL) or { dataUrl } (base64).
 * - If Cloudinary is configured, uploads dataUrl to Cloudinary and returns the
 *   secure URL. Remote URLs are validated and passed through (also stored in
 *   the media collection for tracking).
 * - If Cloudinary is NOT configured (sandbox), only URL passthrough is allowed
 *   (no local filesystem storage — per deployment requirements).
 */
export const POST = api(async (ctx, req) => {
    const body = await parseJson(req);
    let url = "";
    let publicId = null;
    if (body.dataUrl && isCloudinaryConfigured()) {
        const res = await uploadToCloudinary(body.dataUrl);
        url = res.url;
        publicId = res.publicId;
    }
    else if (body.url) {
        url = normalizeImageUrl(body.url);
        if (!url)
            return jsonError("Invalid image URL", 400);
    }
    else if (body.dataUrl && !isCloudinaryConfigured()) {
        return jsonError("Cloudinary not configured. Provide an image URL instead.", 400);
    }
    else {
        return jsonError("Provide an image URL or base64 dataUrl", 400);
    }
    const media = await db.media.create({
        data: { url, publicId, uploaderId: ctx.user.id },
    });
    return jsonOk({ url: media.url, publicId: media.publicId, id: media.id });
}, { requireAuth: true, roles: ["ADMIN", "WRITER"] });
