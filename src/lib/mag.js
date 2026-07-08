/* --------------------------------- slugify -------------------------------- */
export function slugify(input) {
    return input
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}
export async function uniqueSlug(base, model, excludeId) {
    const { db } = await import("@/lib/db");
    let slug = slugify(base) || "untitled";
    let i = 1;
    while (true) {
        let exists = false;
        if (model === "article") {
            const a = await db.article.findUnique({ where: { slug } });
            exists = !!a && a.id !== excludeId;
        }
        else if (model === "category") {
            const c = await db.category.findUnique({ where: { slug } });
            exists = !!c && c.id !== excludeId;
        }
        else {
            const t = await db.tag.findUnique({ where: { slug } });
            exists = !!t && t.id !== excludeId;
        }
        if (!exists)
            return slug;
        i += 1;
        slug = `${slugify(base)}-${i}`;
    }
}
/* ------------------------------ tag helpers ------------------------------- */
export function parseTags(raw) {
    if (!raw)
        return [];
    try {
        const v = JSON.parse(raw);
        if (Array.isArray(v))
            return v.map((x) => String(x));
    }
    catch {
        // fallback: comma separated
        return raw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    }
    return [];
}
export function stringifyTags(tags) {
    return JSON.stringify(tags);
}
/* ----------------------------- date formatting ---------------------------- */
export function formatDate(date, opts = { year: "numeric", month: "short", day: "numeric" }) {
    if (!date)
        return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime()))
        return "";
    return d.toLocaleDateString("en-US", opts);
}
export function relativeTime(date) {
    if (!date)
        return "";
    const d = typeof date === "string" ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60)
        return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60)
        return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24)
        return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30)
        return `${day}d ago`;
    return formatDate(d);
}
export function readingTime(html) {
    if (!html)
        return "1 min read";
    const text = html.replace(/<[^>]+>/g, " ");
    const words = text.trim().split(/\s+/).length;
    return `${Math.max(1, Math.round(words / 200))} min read`;
}
/* --------------------------- excerpt helper ------------------------------- */
export function excerptFromHtml(html, max = 180) {
    if (!html)
        return "";
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length <= max)
        return text;
    return text.slice(0, max).trimEnd() + "…";
}
/* ------------------------------ site url ---------------------------------- */
export const SITE_URL = process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
