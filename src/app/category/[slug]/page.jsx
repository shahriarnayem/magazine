import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getCategoryBySlug, getArticlesByCategory, getAllCategories, safeGetCurrentUser, } from "@/lib/queries";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CategoryBar } from "@/components/site/category-bar";
import { ArticleCard } from "@/components/site/article-card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, } from "@/components/ui/pagination";
const LIMIT = 9;
export async function generateMetadata({ params, }) {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category)
        return { title: "Category not found" };
    return {
        title: `${category.name} — Bangladeshist Magazine`,
        description: category.description || `Articles in ${category.name} on Bangladeshist Magazine.`,
        openGraph: {
            title: `${category.name} — Bangladeshist Magazine`,
            description: category.description || `Articles in ${category.name} on Bangladeshist Magazine.`,
            type: "website",
        },
    };
}
export default async function CategoryPage({ params, searchParams }) {
    const { slug } = await params;
    const { page: pageStr } = await searchParams;
    const page = Math.max(parseInt(pageStr || "1", 10) || 1, 1);
    const [user, allCategories, category] = await Promise.all([
        safeGetCurrentUser(),
        getAllCategories(),
        getCategoryBySlug(slug),
    ]);
    if (!category)
        notFound();
    const { articles, total, limit } = await getArticlesByCategory(slug, {
        page,
        limit: LIMIT,
    });
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return (<div className="flex min-h-screen flex-col">
      <SiteHeader user={user} categories={allCategories}/>
      <CategoryBar categories={allCategories} active={category.slug}/>

      <main className="flex-1">
        <section className="magazine-container py-10 md:py-14 border-b border-border">
          <p className="text-xs uppercase tracking-widest text-primary mb-2">
            Category
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {category.name}
          </h1>
          {category.description && (<p className="mt-3 text-base text-muted-foreground max-w-2xl leading-relaxed">
              {category.description}
            </p>)}
          <p className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">
            {total} article{total === 1 ? "" : "s"}
          </p>
        </section>

        <section className="magazine-container py-8 md:py-12">
          {articles.length === 0 ? (<div className="rounded-md border border-dashed border-border p-12 text-center text-muted-foreground">
              No articles in this category yet.
            </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((a) => (<ArticleCard key={a.id} article={a}/>))}
            </div>)}

          {totalPages > 1 && (<Pagination className="mt-10">
              <PaginationContent>
                {page > 1 && (<PaginationItem>
                    <PaginationPrevious href={`/category/${slug}?page=${page - 1}`}/>
                  </PaginationItem>)}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                // show first, last, current ±1
                if (p === 1 || p === totalPages)
                    return true;
                if (Math.abs(p - page) <= 1)
                    return true;
                return false;
            })
                .map((p, i, arr) => {
                const prev = arr[i - 1];
                const gap = prev && p - prev > 1;
                return (<span key={p} className="flex items-center">
                        {gap && (<span className="px-2 text-muted-foreground">…</span>)}
                        <PaginationItem>
                          <PaginationLink href={`/category/${slug}?page=${p}`} isActive={p === page}>
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      </span>);
            })}
                {page < totalPages && (<PaginationItem>
                    <PaginationNext href={`/category/${slug}?page=${page + 1}`}/>
                  </PaginationItem>)}
              </PaginationContent>
            </Pagination>)}

          <div className="mt-10 text-center">
            <Link href="/" className="text-xs uppercase tracking-wider text-foreground/70 hover:text-primary inline-flex items-center gap-1">
              Back to all stories <ArrowRight className="h-3 w-3"/>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter categories={allCategories}/>
    </div>);
}
