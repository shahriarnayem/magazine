import { db } from "@/lib/db";
import { SITE_URL, excerptFromHtml } from "@/lib/mag";
export const revalidate = 1800;
export const dynamic = "force-static";
function xmlEscape(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
export async function GET() {
    const articles = await db.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 20,
        include: { category: true },
    });
    const items = articles
        .map((a) => {
        const url = `${SITE_URL}/${a.slug}`;
        const excerpt = a.excerpt || excerptFromHtml(a.contentHtml);
        return `    <item>
      <title>${xmlEscape(a.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(a.publishedAt || a.createdAt).toUTCString()}</pubDate>
      <description>${xmlEscape(excerpt)}</description>${a.category ? `\n      <category>${xmlEscape(a.category.name)}</category>` : ""}
      <dc:creator>${xmlEscape(a.authorName)}</dc:creator>
    </item>`;
    })
        .join("\n");
    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Bangladeshist Magazine</title>
    <link>${SITE_URL}</link>
    <description>Culture, Tech &amp; Ideas from Bangladesh and beyond.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
    return new Response(feed, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
    });
}
