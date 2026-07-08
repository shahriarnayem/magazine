import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Eye, ArrowRight, Tag as TagIcon, } from "lucide-react";
import { getArticleBySlug, incrementViews, getRelatedArticles, getAllCategories, safeGetCurrentUser, } from "@/lib/queries";
import { db } from "@/lib/db";
import { formatDate, readingTime, SITE_URL } from "@/lib/mag";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ArticleCard } from "@/components/site/article-card";
import { BookmarkButton } from "@/components/site/bookmark-button";
import { ShareButton } from "@/components/site/share-button";
import { CommentSection } from "@/components/site/comment-section";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb";
export async function generateMetadata({ params, }) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article)
        return { title: "Article not found" };
    const title = article.seoTitle || article.title;
    const description = article.seoDescription || article.excerpt || "";
    const image = article.ogImage || article.thumbnail;
    return {
        title,
        description,
        alternates: {
            canonical: `${SITE_URL}/${article.slug}`,
        },
        openGraph: {
            type: "article",
            title,
            description,
            url: `${SITE_URL}/${article.slug}`,
            images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
            publishedTime: article.publishedAt ?? undefined,
            authors: [article.authorName],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image] : undefined,
        },
    };
}
export default async function ArticlePage({ params }) {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article)
        notFound();
    // Increment views server-side (avoid calling API which would double-count)
    await incrementViews(article.id);
    const [user, allCategories, related] = await Promise.all([
        safeGetCurrentUser(),
        getAllCategories(),
        getRelatedArticles({
            id: article.id,
            categoryId: article.category?.id,
            tags: article.tags,
        }, 3),
    ]);
    // Initial bookmark state for current user
    let bookmarked = false;
    if (user) {
        const b = await db.bookmark.findUnique({
            where: {
                userId_articleId: { userId: user.id, articleId: article.id },
            },
            select: { id: true },
        });
        bookmarked = !!b;
    }
    const publishedDate = article.publishedAt
        ? new Date(article.publishedAt)
        : new Date(article.createdAt);
    const rt = readingTime(article.contentHtml);
    const ogImage = article.ogImage || article.thumbnail || undefined;
    // JSON-LD NewsArticle
    const newsArticleLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: article.title,
        image: ogImage ? [ogImage] : undefined,
        datePublished: publishedDate.toISOString(),
        dateModified: publishedDate.toISOString(),
        author: {
            "@type": "Person",
            name: article.authorName,
        },
        publisher: {
            "@type": "Organization",
            name: "Bangladeshist Magazine",
            logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/logo.svg`,
            },
        },
        description: article.seoDescription || article.excerpt || "",
        articleSection: article.category?.name,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${SITE_URL}/${article.slug}`,
        },
    };
    // JSON-LD Breadcrumb
    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
            },
            ...(article.category
                ? [
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: article.category.name,
                        item: `${SITE_URL}/category/${article.category.slug}`,
                    },
                    {
                        "@type": "ListItem",
                        position: 3,
                        name: article.title,
                        item: `${SITE_URL}/${article.slug}`,
                    },
                ]
                : [
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: article.title,
                        item: `${SITE_URL}/${article.slug}`,
                    },
                ]),
        ],
    };
    return (<div className="flex min-h-screen flex-col">
      <SiteHeader user={user} categories={allCategories}/>

      <main className="flex-1">
        <article className="magazine-container py-6 md:py-10 max-w-3xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {article.category && (<>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/category/${article.category.slug}`}>
                        {article.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>)}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground/70 line-clamp-1">
                  {article.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <header className="mb-6 md:mb-8">
            {article.category && (<Link href={`/category/${article.category.slug}`} className="text-accent-red uppercase tracking-widest text-xs font-medium hover:underline">
                {article.category.name}
              </Link>)}
            <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              {article.title}
            </h1>
            {article.excerpt && (<p className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>)}

            {/* Author row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  {article.authorImage ? (<AvatarImage src={article.authorImage} alt={article.authorName}/>) : null}
                  <AvatarFallback className="bg-muted text-xs font-semibold">
                    {article.authorName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {article.authorName}
                  </span>
                  {article.authorBio && (<span className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                      {article.authorBio}
                    </span>)}
                  <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <time dateTime={publishedDate.toISOString()}>
                      {formatDate(publishedDate, {
            year: "numeric",
            month: "long",
            day: "numeric",
        })}
                    </time>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3"/>
                      {rt}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3"/>
                      {(article.views + 1).toLocaleString()} views
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <BookmarkButton articleId={article.id} bookmarked={bookmarked} loggedIn={!!user} variant="button"/>
                <ShareButton slug={article.slug} title={article.title}/>
              </div>
            </div>
          </header>

          {/* Hero image */}
          {article.thumbnail && (<div className="mb-8 overflow-hidden rounded-md border border-border">
              
              <img src={article.thumbnail} alt={article.title} className="w-full h-auto object-cover"/>
            </div>)}

          {/* Body */}
          <div className="article-prose" dangerouslySetInnerHTML={{ __html: article.contentHtml }}/>

          {/* Tags */}
          {article.tags.length > 0 && (<div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              <TagIcon className="h-4 w-4 text-muted-foreground"/>
              {article.tags.map((t) => (<Badge key={t} variant="outline" className="text-xs text-foreground/70 border-border">
                  {t}
                </Badge>))}
            </div>)}

          {/* Comments */}
          <CommentSection articleId={article.id} loggedIn={!!user} userName={user?.name}/>
        </article>

        {/* Related */}
        {related.length > 0 && (<section className="magazine-container py-10 md:py-14 border-t border-border">
            <div className="flex items-end justify-between mb-6 pb-2 border-b border-border">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary mb-1">
                  More from {article.category?.name ?? "the magazine"}
                </p>
                <h2 className="text-2xl font-bold tracking-tight">
                  Related stories
                </h2>
              </div>
              {article.category && (<Link href={`/category/${article.category.slug}`} className="text-xs uppercase tracking-wider text-foreground/70 hover:text-primary inline-flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3"/>
                </Link>)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((a) => (<ArticleCard key={a.id} article={a}/>))}
            </div>
          </section>)}
      </main>

      <SiteFooter categories={allCategories}/>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleLd) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}/>
    </div>);
}
