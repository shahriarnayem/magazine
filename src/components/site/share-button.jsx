"use client";
import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SITE_URL } from "@/lib/mag";
export function ShareButton({ slug, title }) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    const url = `${SITE_URL}/${slug}`;
    async function handleClick() {
        // Try native share first (mobile)
        if (typeof navigator !== "undefined" && "share" in navigator) {
            try {
                await navigator.share({ title, url });
                return;
            }
            catch {
                // user cancelled or unsupported; fall through to copy
            }
        }
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                toast({
                    title: "Link copied",
                    description: "Article URL copied to clipboard.",
                });
                setTimeout(() => setCopied(false), 1800);
            }
            catch {
                toast({
                    title: "Could not copy",
                    description: "Copy this URL manually: " + url,
                    variant: "destructive",
                });
            }
        }
    }
    return (<button type="button" onClick={handleClick} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors">
      {copied ? (<>
          <Check className="h-3.5 w-3.5 text-primary"/>
          Copied
        </>) : (<>
          <Share2 className="h-3.5 w-3.5"/>
          Share
        </>)}
      <Link2 className="sr-only"/>
    </button>);
}
