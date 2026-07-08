import { redirect } from "next/navigation";
import { getAllCategories, getBookmarkedArticles, safeGetCurrentUser } from "@/lib/queries";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ArticleCard } from "@/components/site/article-card";
import { Bookmark } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function BookmarksPage() {
    const user = await safeGetCurrentUser();
    if (!user)
        redirect("/login");
    const [allCategories, bookmarks] = await Promise.all([
        getAllCategories(),
        getBookmarkedArticles(user.id),
    ]);
    return (<div className="flex min-h-screen flex-col">
      <SiteHeader user={user} categories={allCategories}/>

      <main className="flex-1">
        <section className="magazine-container py-10 md:py-14 border-b border-border">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-2">
            <Bookmark className="h-3.5 w-3.5"/>
            Your reading list
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Bookmarks
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-2xl">
            Stories you saved for later.
          </p>
        </section>

        <section className="magazine-container py-8 md:py-12">
          {bookmarks.length === 0 ? (<div className="rounded-md border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                You haven't bookmarked anything yet.
              </p>
              <a href="/" className="text-primary text-sm font-medium hover:underline">
                Browse stories →
              </a>
            </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bookmarks.map((b) => (<ArticleCard key={b.id} article={b.article}/>))}
            </div>)}
        </section>
      </main>

      <SiteFooter categories={allCategories}/>
    </div>);
}
