"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Search, User as UserIcon, Bookmark, LayoutDashboard, LogOut, ChevronDown, Loader2, FileText, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose, } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, } from "@/components/ui/command";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/site/theme-toggle";
export function SiteHeader({ user, categories }) {
    const router = useRouter();
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    // Cmd+K to open search
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setSearchOpen((v) => !v);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);
    const runSearch = useCallback(async (q) => {
        if (!q.trim()) {
            setResults([]);
            setSearching(false);
            return;
        }
        setSearching(true);
        try {
            const res = await fetch(`/api/articles?q=${encodeURIComponent(q)}&limit=8`);
            if (!res.ok)
                throw new Error();
            const data = (await res.json());
            setResults(data.articles || []);
        }
        catch {
            setResults([]);
        }
        finally {
            setSearching(false);
        }
    }, []);
    useEffect(() => {
        const t = setTimeout(() => runSearch(query), 220);
        return () => clearTimeout(t);
    }, [query, runSearch]);
    function go(slug) {
        setSearchOpen(false);
        setQuery("");
        setResults([]);
        router.push(`/${slug}`);
    }
    async function logout() {
        try {
            await fetch(`/api/auth/logout`, { method: "POST" });
        }
        catch {
            // ignore
        }
        router.push("/");
        router.refresh();
    }
    const isStaff = user?.role === "ADMIN" || user?.role === "WRITER";
    return (<header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="magazine-container flex h-16 items-center justify-between gap-4">
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-foreground" aria-label="Open menu">
                <Menu className="h-5 w-5"/>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-background border-r border-border">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Link href="/" className="inline-flex items-baseline">
                    <span className="text-primary">•</span>
                    <span className="ml-1 font-bold tracking-tight">BANGLADESHIST</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4 mt-4">
                <SheetClose asChild>
                  <Link href="/" className="py-2 text-sm border-b border-border text-foreground/80 hover:text-primary">
                    All
                  </Link>
                </SheetClose>
                {categories.map((c) => (<SheetClose asChild key={c.id}>
                    <Link href={`/category/${c.slug}`} className="py-2 text-sm border-b border-border text-foreground/80 hover:text-primary">
                      {c.name}
                    </Link>
                  </SheetClose>))}
              </nav>
              <div className="mt-6 px-4 flex flex-col gap-2">
                {user ? (<>
                    <SheetClose asChild>
                      <Link href="/profile" className="text-sm text-foreground/80 hover:text-primary">
                        Profile
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/bookmarks" className="text-sm text-foreground/80 hover:text-primary">
                        Bookmarks
                      </Link>
                    </SheetClose>
                    {isStaff && (<SheetClose asChild>
                        <Link href="/dashboard" className="text-sm text-foreground/80 hover:text-primary">
                          Dashboard
                        </Link>
                      </SheetClose>)}
                    <button onClick={logout} className="text-left text-sm text-foreground/80 hover:text-primary py-1">
                      Logout
                    </button>
                  </>) : (<>
                    <SheetClose asChild>
                      <Link href="/login" className="text-sm text-foreground/80 hover:text-primary">
                        Login
                      </Link>
                    </SheetClose>
                  </>)}
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-baseline shrink-0">
            <span className="text-primary text-xl leading-none">•</span>
            <span className="ml-1 font-bold tracking-tight text-base md:text-lg">
              BANGLADESHIST
            </span>
          </Link>
        </div>

        {/* Center: category nav (desktop) */}
        <nav className="hidden md:flex items-center gap-5 flex-1 justify-center">
          <Link href="/" className={`text-xs uppercase tracking-wider hover:text-primary transition-colors ${pathname === "/" ? "text-primary" : "text-foreground/70"}`}>
            All
          </Link>
          {categories.slice(0, 6).map((c) => (<Link key={c.id} href={`/category/${c.slug}`} className={`text-xs uppercase tracking-wider hover:text-primary transition-colors ${pathname === `/category/${c.slug}`
                ? "text-primary"
                : "text-foreground/70"}`}>
              {c.name}
            </Link>))}
        </nav>

        {/* Right: search + auth */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)} className="text-foreground/70 hover:text-primary gap-2" aria-label="Search">
            <Search className="h-4 w-4"/>
            <span className="hidden lg:inline text-xs">Search</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border px-1 text-[10px] text-muted-foreground">
              ⌘K
            </kbd>
          </Button>

          <ThemeToggle />

          {user ? (<DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 px-1.5 hover:bg-accent">
                  <Avatar className="h-7 w-7 border border-border">
                    {user.image ? (<AvatarImage src={user.image} alt={user.name || user.email}/>) : null}
                    <AvatarFallback className="bg-muted text-[10px] font-semibold">
                      {(user.name || user.email).slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs max-w-[120px] truncate">
                    {user.name || user.email.split("@")[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm">{user.name || "Reader"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <UserIcon className="h-4 w-4"/>
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bookmarks" className="cursor-pointer">
                    <Bookmark className="h-4 w-4"/>
                    Bookmarks
                  </Link>
                </DropdownMenuItem>
                {isStaff && (<DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="h-4 w-4"/>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>)}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-primary focus:text-primary">
                  <LogOut className="h-4 w-4"/>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>) : (<div className="flex items-center gap-2">
              <Button asChild size="sm" className="hidden sm:inline-flex bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/login">Login</Link>
              </Button>
            </div>)}
        </div>
      </div>

      {/* Search dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search articles…" value={query} onValueChange={setQuery}/>
        <CommandList>
          {searching ? (<div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin"/> Searching…
            </div>) : query.trim() === "" ? (<CommandEmpty>Type to search articles…</CommandEmpty>) : results.length === 0 ? (<CommandEmpty>No articles found.</CommandEmpty>) : (<CommandGroup heading="Articles">
              {results.map((r) => (<CommandItem key={r.id} value={`${r.title} ${r.category?.name ?? ""}`} onSelect={() => go(r.slug)} className="cursor-pointer">
                  <FileText className="h-4 w-4 text-muted-foreground"/>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm truncate">{r.title}</span>
                    {r.category && (<span className="text-[11px] text-accent-red uppercase tracking-wider">
                        {r.category.name}
                      </span>)}
                  </div>
                </CommandItem>))}
            </CommandGroup>)}
        </CommandList>
      </CommandDialog>
    </header>);
}
