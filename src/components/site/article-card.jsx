import Link from "next/link";
import { Eye, Clock } from "lucide-react";
import { relativeTime, readingTime } from "@/lib/mag";
function Kicker({ category }) {
    if (!category)
        return null;
    return (<Link href={`/category/${category.slug}`} className="text-accent-red uppercase tracking-wider text-[11px] font-medium hover:underline">
      {category.name}
    </Link>);
}
function AuthorRow({ authorName, authorImage, publishedAt, withReadingTime, excerpt, }) {
    const rt = excerpt ? readingTime(excerpt) : null;
    return (<div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        {authorImage ? (<img src={authorImage} alt={authorName} className="h-5 w-5 rounded-full object-cover border border-border"/>) : (<div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground">
            {authorName.slice(0, 1).toUpperCase()}
          </div>)}
        <span className="text-foreground/80">{authorName}</span>
      </div>
      <span className="text-muted-foreground/60">·</span>
      <time dateTime={publishedAt ?? undefined}>
        {relativeTime(publishedAt)}
      </time>
      {withReadingTime && rt && (<>
          <span className="text-muted-foreground/60">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3"/>
            {rt}
          </span>
        </>)}
    </div>);
}
export function ArticleCard({ article, variant = "default", index = 0 }) {
    const href = `/${article.slug}`;
    if (variant === "hero") {
        return (<article className="group grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
        <Link href={href} className="block overflow-hidden rounded-md border border-border bg-card">
          <div className="aspect-[16/10] overflow-hidden bg-muted">
            {article.thumbnail ? (<img src={article.thumbnail} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/>) : (<div className="h-full w-full bg-gradient-to-br from-muted to-secondary"/>)}
          </div>
        </Link>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Kicker category={article.category}/>
            {article.featured && (<span className="bg-accent-red text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                Featured
              </span>)}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
            <Link href={href} className="hover:text-primary transition-colors">
              {article.title}
            </Link>
          </h2>
          {article.excerpt && (<p className="text-base md:text-lg text-muted-foreground leading-relaxed line-clamp-3">
              {article.excerpt}
            </p>)}
          <AuthorRow authorName={article.authorName} authorImage={article.authorImage} publishedAt={article.publishedAt} withReadingTime excerpt={article.excerpt}/>
        </div>
      </article>);
    }
    if (variant === "compact") {
        return (<article className="group flex gap-3">
        <Link href={href} className="shrink-0 overflow-hidden rounded-md border border-border bg-card w-20 h-20">
          <div className="aspect-square h-full w-full overflow-hidden">
            {article.thumbnail ? (<img src={article.thumbnail} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"/>) : (<div className="h-full w-full bg-muted"/>)}
          </div>
        </Link>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {article.category && (<span className="text-accent-red uppercase tracking-wider text-[10px] font-medium">
              {article.category.name}
            </span>)}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">
            <Link href={href} className="hover:text-primary transition-colors">
              {article.title}
            </Link>
          </h3>
          <span className="text-[11px] text-muted-foreground">
            {relativeTime(article.publishedAt)}
          </span>
        </div>
      </article>);
    }
    if (variant === "list") {
        return (<article className="group flex items-start gap-4 py-3 border-b border-border last:border-b-0">
        <span className="text-2xl font-bold text-accent-red leading-none w-7 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {article.category && (<span className="text-accent-red uppercase tracking-wider text-[10px] font-medium">
              {article.category.name}
            </span>)}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">
            <Link href={href} className="hover:text-primary transition-colors">
              {article.title}
            </Link>
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{article.authorName}</span>
            <span className="text-muted-foreground/60">·</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3"/>
              {article.views.toLocaleString()}
            </span>
          </div>
        </div>
      </article>);
    }
    // default
    return (<article className="group flex flex-col bg-card border border-border rounded-md overflow-hidden hover:border-foreground/20 transition-colors">
      <Link href={href} className="block overflow-hidden">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {article.thumbnail ? (<img src={article.thumbnail} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"/>) : (<div className="h-full w-full bg-gradient-to-br from-muted to-secondary"/>)}
        </div>
      </Link>
      <div className="flex flex-col gap-2 p-4 flex-1">
        <Kicker category={article.category}/>
        <h3 className="text-lg font-semibold leading-snug line-clamp-2">
          <Link href={href} className="hover:text-primary transition-colors">
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>)}
        <div className="mt-auto pt-2">
          <AuthorRow authorName={article.authorName} authorImage={article.authorImage} publishedAt={article.publishedAt}/>
        </div>
      </div>
    </article>);
}
