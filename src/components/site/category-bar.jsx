import Link from "next/link";
export function CategoryBar({ categories, active }) {
    return (<nav aria-label="Categories" className="border-b border-border bg-background">
      <div className="magazine-container">
        <ul className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          <li>
            <Link href="/" className={`inline-block whitespace-nowrap px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors ${active === undefined || active === "all"
            ? "text-primary border-b border-primary"
            : "text-foreground/70 hover:text-foreground"}`}>
              All
            </Link>
          </li>
          {categories.map((c) => {
            const isActive = active === c.slug;
            return (<li key={c.id}>
                <Link href={`/category/${c.slug}`} className={`inline-block whitespace-nowrap px-3 py-1.5 text-xs uppercase tracking-wider rounded-sm transition-colors ${isActive
                    ? "text-primary border-b border-primary"
                    : "text-foreground/70 hover:text-foreground"}`}>
                  {c.name}
                </Link>
              </li>);
        })}
        </ul>
      </div>
    </nav>);
}
