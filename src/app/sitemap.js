import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/mag";
export const revalidate = 3600;
export default async function sitemap() {
    const [articles, categories] = await Promise.all([
        db.article.findMany({
            where: { status: "PUBLISHED" },
            select: { slug: true, updatedAt: true },
        }),
        db.category.findMany({ select: { slug: true, updatedAt: true } }),
    ]);
    const staticRoutes = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
        { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
        { url: `${SITE_URL}/admin-login`, changeFrequency: "monthly", priority: 0.2 },
    ];
    const categoryRoutes = categories.map((c) => ({
        url: `${SITE_URL}/category/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "daily",
        priority: 0.7,
    }));
    const articleRoutes = articles.map((a) => ({
        url: `${SITE_URL}/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
    }));
    return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
