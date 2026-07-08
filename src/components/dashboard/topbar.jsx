"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, LogOut, User as UserIcon, ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
function initials(name) {
    if (!name)
        return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1)
        return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function RoleBadge({ role }) {
    if (role === "ADMIN") {
        return (<Badge className="bg-primary/15 text-primary border border-primary/30">
        ADMIN
      </Badge>);
    }
    if (role === "WRITER") {
        return (<Badge className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
        WRITER
      </Badge>);
    }
    return (<Badge variant="secondary" className="text-muted-foreground">
      READER
    </Badge>);
}
export function Topbar({ user, title }) {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
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
    return (<header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6">
      {/* Mobile hamburger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
            <Menu className="size-5"/>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar user={user} onNavigate={() => setMobileOpen(false)}/>
        </SheetContent>
      </Sheet>

      <div className="flex-1 min-w-0">
        {title ? (<h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h1>) : (<p className="text-sm text-muted-foreground">
            Welcome back, <span className="text-foreground">{user.name || user.email}</span>
          </p>)}
      </div>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 pl-1.5 pr-2">
            <Avatar className="size-7 border border-border">
              {user.image ? (<AvatarImage src={user.image} alt={user.name || user.email}/>) : null}
              <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">
              {user.name || user.email.split("@")[0]}
            </span>
            <ChevronDown className="size-4 text-muted-foreground"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              {user.name || "Unnamed"}
            </span>
            <span className="text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
            <RoleBadge role={user.role}/>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer">
            <UserIcon className="size-4"/>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/")} className="cursor-pointer">
            <ExternalLink className="size-4"/>
            View site
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="size-4"/>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>);
}
