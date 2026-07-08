"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { relativeTime } from "@/lib/mag";
export function CommentSection({ articleId, loggedIn, userName }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/comments/article/${articleId}`, {
                    cache: "no-store",
                });
                if (!res.ok)
                    throw new Error("fetch failed");
                const data = (await res.json());
                if (!cancelled)
                    setComments(data.comments || []);
            }
            catch {
                if (!cancelled)
                    setComments([]);
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [articleId]);
    async function submit(e) {
        e.preventDefault();
        const text = content.trim();
        if (!text)
            return;
        setSubmitting(true);
        const optimistic = {
            id: `tmp-${Date.now()}`,
            userName: userName || "You",
            userImage: null,
            content: text,
            createdAt: new Date().toISOString(),
            status: "PENDING",
        };
        setComments((c) => [optimistic, ...c]);
        setContent("");
        try {
            const res = await fetch(`/api/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ articleId, content: text }),
            });
            if (!res.ok) {
                const err = (await res.json().catch(() => ({})));
                throw new Error(err.error || "Failed to post comment");
            }
            toast({
                title: "Comment submitted",
                description: "Your comment is awaiting approval.",
            });
        }
        catch (err) {
            setComments((c) => c.filter((x) => x.id !== optimistic.id));
            setContent(text);
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "Could not post comment.",
                variant: "destructive",
            });
        }
        finally {
            setSubmitting(false);
        }
    }
    return (<section id="comments" className="mt-16 border-t border-border pt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5 text-primary"/>
        <h2 className="text-xl font-bold tracking-tight">
          Comments
          <span className="ml-2 text-sm text-muted-foreground font-normal">
            ({comments.length})
          </span>
        </h2>
      </div>

      {loggedIn ? (<form onSubmit={submit} className="mb-8">
          <Textarea placeholder="Share your thoughts…" value={content} onChange={(e) => setContent(e.target.value)} rows={4} maxLength={2000} required className="bg-background/40 resize-y"/>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Comments are moderated before they appear publicly.
            </p>
            <Button type="submit" disabled={submitting || !content.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {submitting ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<Send className="h-4 w-4"/>)}
              Post Comment
            </Button>
          </div>
        </form>) : (<div className="mb-8 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground flex items-center justify-between flex-wrap gap-3">
          <span>Want to join the conversation?</span>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Login to comment →
          </Link>
        </div>)}

      {loading ? (<div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2"/>
          Loading comments…
        </div>) : comments.length === 0 ? (<div className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No comments yet. Be the first to share your thoughts.
        </div>) : (<ul className="flex flex-col gap-4">
          {comments.map((c) => (<li key={c.id} className="rounded-md border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 border border-border">
                  {c.userImage ? (<AvatarImage src={c.userImage} alt={c.userName}/>) : null}
                  <AvatarFallback className="bg-muted text-xs font-semibold">
                    {c.userName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{c.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(c.createdAt)}
                    </span>
                    {c.status === "PENDING" && (<span className="text-[10px] uppercase tracking-wider text-primary border border-primary/40 px-1.5 py-0.5 rounded-sm">
                        Pending
                      </span>)}
                  </div>
                  <p className="mt-1.5 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {c.content}
                  </p>
                </div>
              </div>
            </li>))}
        </ul>)}
    </section>);
}
