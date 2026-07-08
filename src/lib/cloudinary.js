import { v2 as cloudinary } from "cloudinary";
export function isCloudinaryConfigured() {
    return !!(process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET);
}
function configureCloudinary() {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
}
/**
 * Upload a base64 data URL (or any buffer-like image) to Cloudinary and return
 * the secure URL. Throws if Cloudinary is not configured.
 */
export async function uploadToCloudinary(dataUrl, folder = "bangladeshist") {
    if (!isCloudinaryConfigured()) {
        throw new Error("Cloudinary is not configured");
    }
    configureCloudinary();
    const res = await cloudinary.uploader.upload(dataUrl, {
        folder,
        resource_type: "image",
    });
    return { url: res.secure_url, publicId: res.public_id };
}
/**
 * Validate and normalize an externally provided image URL (e.g. a thumbnail URL
 * pasted by a writer). Used as a sandbox-safe fallback when Cloudinary is not
 * configured.
 */
export function normalizeImageUrl(url) {
    const trimmed = url.trim();
    if (!trimmed)
        return "";
    if (/^https?:\/\//i.test(trimmed))
        return trimmed;
    if (/^data:image\//i.test(trimmed))
        return trimmed;
    return "";
}
