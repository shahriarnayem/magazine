"use client";
import { useState, useEffect } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
export function BookmarkButton({ articleId, bookmarked, loggedIn, className, variant = "icon", }) {
    const [active, setActive] = useState(bookmarked);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    useEffect(() => {
        setActive(bookmarked);
    }, [bookmarked]);
    if (!loggedIn)
        return null;
    async function toggle() {
        setLoading(true);
        const prev = active;
        setActive(!prev);
        try {
            const method = prev ? "DELETE" : "POST";
            const url = prev
                ? `/api/bookmarks/${articleId}`
                : `/api/bookmarks`;
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: prev ? undefined : JSON.stringify({ articleId }),
            });
            if (!res.ok)
                throw new Error("Failed");
            const data = (await res.json());
            const next = prev ? false : data.bookmarked ?? true;
            setActive(next);
            toast({
                title: next ? "Saved" : "Removed",
                description: next
                    ? "Added to your bookmarks."
                    : "Removed from your bookmarks.",
            });
        }
        catch {
            setActive(prev);
            toast({
                title: "Error",
                description: "Could not update bookmark.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    }
    if (variant === "button") {
        return (<button type="button" onClick={toggle} disabled={loading} className={cn("inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors", active
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-foreground/70 hover:text-foreground hover:border-foreground/30", className)} aria-pressed={active}>
        {loading ? (<Loader2 className="h-3.5 w-3.5 animate-spin"/>) : (<Bookmark className={cn("h-3.5 w-3.5", active && "fill-current")}/>)}
        {active ? "Saved" : "Save"}
      </button>);
    }
    return (<button type="button" onClick={toggle} disabled={loading} aria-label={active ? "Remove bookmark" : "Save bookmark"} aria-pressed={active} className={cn("inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors", active
            ? "border-primary text-primary bg-primary/10"
            : "border-border text-foreground/70 hover:text-foreground hover:border-foreground/30", className)}>
      {loading ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<Bookmark className={cn("h-4 w-4", active && "fill-current")}/>)}
    </button>);
}
