import Link from "next/link";
import { ArrowRight, TrendingUp, Flame } from "lucide-react";
import { getFeaturedArticle, getPublishedArticles, getTrendingArticles, getAllCategories, safeGetCurrentUser, } from "@/lib/queries";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CategoryBar } from "@/components/site/category-bar";
import { ArticleCard } from "@/components/site/article-card";
export const dynamic = "force-dynamic";
export default async function HomePage() {
    const [user, categories, featured, trending] = await Promise.all([
        safeGetCurrentUser(),
        getAllCategories(),
        getFeaturedArticle(),
        getTrendingArticles(5),
    ]);
    const topCategories = categories
        .slice()
        .sort((a, b) => b.articleCount - a.articleCount)
        .slice(0, 3);
    // After the hero (if any), fetch small grid + category sections + latest list
    // in parallel for fast first paint.
    const featuredId = featured?.id;
    const [recentPack, ...categoryFetches] = await Promise.all([
        getPublishedArticles({ limit: 6, excludeId: featuredId }),
        ...topCategories.map((c) => getPublishedArticles({ categorySlug: c.slug, limit: 3 })),
    ]);
    // "Fresh dispatches" shows the first 4 of the latest pack; the remaining (or
    // up to 6) feed the compact "latest" sidebar list.
    const fresh = recentPack.articles.slice(0, 4);
    const latest = recentPack.articles.slice(0, 6);
    return (<div className="flex min-h-screen flex-col">
      <SiteHeader user={user} categories={categories}/>
      <CategoryBar categories={categories} active="all"/>

      <main className="flex-1">
        {/* Hero */}
        <section className="magazine-container py-8 md:py-12">
          {featured ? (<ArticleCard article={featured} variant="hero"/>) : (<div className="rounded-md border border-dashed border-border p-12 text-center text-muted-foreground">
              No articles published yet.
            </div>)}
        </section>

        {/* Recent grid */}
        {fresh.length > 0 && (<section className="magazine-container py-6 md:py-8 border-t border-border">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary mb-1">
                  Latest
                </p>
                <h2 className="text-2xl font-bold tracking-tight">Fresh Dispatches</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {fresh.map((a) => (<ArticleCard key={a.id} article={a}/>))}
            </div>
          </section>)}

        {/* Trending + category sections */}
        <section className="magazine-container py-8 md:py-12 border-t border-border grid lg:grid-cols-3 gap-10">
          {/* Left: 2 category blocks */}
          <div className="lg:col-span-2 flex flex-col gap-12">
            {topCategories.slice(0, 2).map((cat, i) => {
            const list = categoryFetches[i]?.articles ?? [];
            if (list.length === 0)
                return null;
            return (<div key={cat.id}>
                  <div className="flex items-end justify-between mb-5 pb-2 border-b border-border">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-primary mb-1">
                        Section
                      </p>
                      <h2 className="text-xl font-bold tracking-tight">
                        {cat.name}
                      </h2>
                      {cat.description && (<p className="text-xs text-muted-foreground mt-1">
                          {cat.description}
                        </p>)}
                    </div>
                    <Link href={`/category/${cat.slug}`} className="text-xs uppercase tracking-wider text-foreground/70 hover:text-primary inline-flex items-center gap-1">
                      View all <ArrowRight className="h-3 w-3"/>
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {list.map((a) => (<ArticleCard key={a.id} article={a}/>))}
                  </div>
                </div>);
        })}
          </div>

          {/* Right: Trending sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
                <Flame className="h-4 w-4 text-primary"/>
                <h2 className="text-xs uppercase tracking-widest text-primary">
                  Trending
                </h2>
              </div>
              {trending.length > 0 ? (<div className="bg-card border border-border rounded-md p-3">
                  {trending.map((a, i) => (<ArticleCard key={a.id} article={a} variant="list" index={i}/>))}
                </div>) : (<p className="text-sm text-muted-foreground">No trending articles.</p>)}

              <div className="mt-6 flex items-center gap-2 mb-4 pb-2 border-b border-border">
                <TrendingUp className="h-4 w-4 text-primary"/>
                <h2 className="text-xs uppercase tracking-widest text-primary">
                  Latest Posts
                </h2>
              </div>
              {latest.length > 0 ? (<div className="bg-card border border-border rounded-md p-3">
                  {latest.map((a, i) => (<ArticleCard key={a.id} article={a} variant="compact" index={i}/>))}
                </div>) : (<p className="text-sm text-muted-foreground">No posts yet.</p>)}
            </div>
          </aside>
        </section>

        {/* Third category section (full width) */}
        {topCategories[2] && categoryFetches[2]?.articles.length ? (<section className="magazine-container py-8 md:py-12 border-t border-border">
            <div className="flex items-end justify-between mb-5 pb-2 border-b border-border">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary mb-1">
                  Section
                </p>
                <h2 className="text-xl font-bold tracking-tight">
                  {topCategories[2].name}
                </h2>
                {topCategories[2].description && (<p className="text-xs text-muted-foreground mt-1">
                    {topCategories[2].description}
                  </p>)}
              </div>
              <Link href={`/category/${topCategories[2].slug}`} className="text-xs uppercase tracking-wider text-foreground/70 hover:text-primary inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3"/>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryFetches[2].articles.map((a) => (<ArticleCard key={a.id} article={a}/>))}
            </div>
          </section>) : null}
      </main>

      <SiteFooter categories={categories}/>
    </div>);
}
