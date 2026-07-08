"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, FileText, MessageSquare, Users, FolderTree, User, LogOut, ExternalLink, Loader2, } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "WRITER"] },
    { href: "/dashboard/articles", label: "Articles", icon: FileText, roles: ["ADMIN", "WRITER"] },
    { href: "/dashboard/comments", label: "Comments", icon: MessageSquare, roles: ["ADMIN"] },
    { href: "/dashboard/users", label: "Users", icon: Users, roles: ["ADMIN"] },
    { href: "/dashboard/categories", label: "Categories", icon: FolderTree, roles: ["ADMIN"] },
    { href: "/dashboard/profile", label: "Profile", icon: User, roles: ["ADMIN", "WRITER"] },
];
export function Sidebar({ user, onNavigate }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const items = NAV_ITEMS.filter((it) => it.roles.includes(user.role));
    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        }
        catch {
            /* ignore */
        }
        finally {
            setLoggingOut(false);
            router.push("/admin-login");
        }
    };
    const isActive = (href) => href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
    return (<div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2" aria-label="Bangladeshist CMS home">
          <span className="text-base font-bold tracking-tight text-foreground">
            BANGLADESHIST
          </span>
          <span className="inline-block size-2 rounded-full bg-primary" aria-hidden/>
          <span className="text-[10px] font-semibold tracking-widest text-muted-foreground">
            CMS
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
        <ul className="space-y-1">
          {items.map((it) => {
            const Icon = it.icon;
            const active = isActive(it.href);
            return (<li key={it.href}>
                <Link href={it.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn("group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors", active
                    ? "bg-primary/10 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground border-l-2 border-transparent")}>
                  <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}/>
                  {it.label}
                </Link>
              </li>);
        })}
        </ul>
      </nav>

      <Separator className="bg-sidebar-border"/>

      {/* Footer */}
      <div className="flex flex-col gap-2 p-3">
        <Button asChild variant="ghost" size="sm" className="justify-start text-muted-foreground hover:text-foreground">
          <Link href="/" onClick={onNavigate}>
            <ExternalLink className="size-4"/>
            View site
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={loggingOut} className="justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive">
          {loggingOut ? (<Loader2 className="size-4 animate-spin"/>) : (<LogOut className="size-4"/>)}
          Log out
        </Button>
      </div>
    </div>);
}
