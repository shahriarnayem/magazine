import Link from "next/link";
import { Twitter, Github, Linkedin, Rss } from "lucide-react";
import { NewsletterForm } from "@/components/site/newsletter-form";
export function SiteFooter({ categories }) {
    const year = new Date().getFullYear();
    return (<footer className="mt-auto border-t border-border bg-card/40">
      {/* Newsletter strip */}
      <div className="border-b border-border">
        <div className="magazine-container py-10 grid gap-6 md:grid-cols-2 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary mb-2">
              Newsletter
            </p>
            <h3 className="text-2xl font-bold tracking-tight">
              Get the dispatch.
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              The week in culture, tech and ideas from Bangladesh — straight to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Columns */}
      <div className="magazine-container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="inline-flex items-baseline">
            <span className="text-primary text-xl leading-none">•</span>
            <span className="ml-1 font-bold tracking-tight">BANGLADESHIST</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
            A digital publication covering culture, technology, politics and ideas
            from Bangladesh and beyond.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-4 w-4"/>
            </a>
            <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary transition-colors">
              <Github className="h-4 w-4"/>
            </a>
            <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-4 w-4"/>
            </a>
            <a href="#" aria-label="RSS" className="text-muted-foreground hover:text-primary transition-colors">
              <Rss className="h-4 w-4"/>
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Categories
          </h4>
          <ul className="flex flex-col gap-2">
            {categories.slice(0, 6).map((c) => (<li key={c.id}>
                <Link href={`/category/${c.slug}`} className="text-sm text-foreground/80 hover:text-primary transition-colors">
                  {c.name}
                </Link>
              </li>))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Company
          </h4>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                About
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Careers
              </a>
            </li>
            <li>
              <Link href="/login" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Reader Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Legal
          </h4>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-foreground/80 hover:text-primary transition-colors">
                Cookies
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="magazine-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {year} Bangladeshist Magazine. All rights reserved.</p>
          <p className="uppercase tracking-widest">
            Built in Dhaka · IBM Plex Mono
          </p>
        </div>
      </div>
    </footer>);
}
