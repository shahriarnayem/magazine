"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Trash2, MessageSquare, Loader2, ShieldAlert, ExternalLink, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
function initials(name) {
    if (!name)
        return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1)
        return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function StatusBadge({ status }) {
    if (status === "APPROVED") {
        return (<Badge className="bg-green-500/15 text-green-400 border border-green-500/30">
        Approved
      </Badge>);
    }
    if (status === "PENDING") {
        return (<Badge className="bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
        Pending
      </Badge>);
    }
    return (<Badge className="bg-destructive/15 text-destructive border border-destructive/30">
      Rejected
    </Badge>);
}
export default function CommentsPage() {
    const { toast } = useToast();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [forbidden, setForbidden] = useState(false);
    const [activeStatus, setActiveStatus] = useState("PENDING");
    const [busyId, setBusyId] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(null);
    const fetchComments = async (status) => {
        setLoading(true);
        setError(null);
        try {
            const url = status === "ALL"
                ? "/api/comments/_"
                : `/api/comments/_?status=${status}`;
            const res = await fetch(url, { credentials: "include" });
            const data = await res.json();
            if (res.status === 403) {
                setForbidden(true);
                return;
            }
            if (!res.ok)
                throw new Error(data?.error || "Failed to load");
            setComments(data.comments || []);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchComments(activeStatus);
    }, [activeStatus]);
    const updateStatus = async (id, status) => {
        setBusyId(id);
        try {
            const res = await fetch(`/api/comments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to update");
            setComments((prev) => 
            // Remove if it no longer matches the active filter
            activeStatus !== "ALL" && status !== activeStatus
                ? prev.filter((c) => c.id !== id)
                : prev.map((c) => (c.id === id ? { ...c, status } : c)));
            toast({
                title: "Updated",
                description: `Comment ${status.toLowerCase()}.`,
            });
        }
        catch (e) {
            toast({
                title: "Error",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setBusyId(null);
        }
    };
    const handleDelete = async (id) => {
        setBusyId(id);
        try {
            const res = await fetch(`/api/comments/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to delete");
            setComments((prev) => prev.filter((c) => c.id !== id));
            toast({ title: "Deleted", description: "Comment removed." });
        }
        catch (e) {
            toast({
                title: "Error",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setBusyId(null);
            setDeleteOpen(null);
        }
    };
    if (forbidden) {
        return (<div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <ShieldAlert className="size-10 text-destructive"/>
        <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Comment moderation is admin-only.
        </p>
      </div>);
    }
    return (<div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Comments
        </h1>
        <p className="text-sm text-muted-foreground">
          Moderate reader feedback across all articles.
        </p>
      </div>

      <Tabs value={activeStatus} onValueChange={setActiveStatus}>
        <TabsList className="bg-card">
          <TabsTrigger value="PENDING" className="gap-1.5">
            Pending
            {activeStatus === "PENDING" && comments.length > 0 && (<Badge className="ml-1 bg-primary/15 text-primary border border-primary/30">
                {comments.length}
              </Badge>)}
          </TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
          <TabsTrigger value="ALL">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-0">
        {error ? (<Card className="bg-card p-6 text-sm text-destructive">
            Failed to load: {error}
          </Card>) : loading ? (<div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (<Card key={i} className="bg-card p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-9 rounded-full"/>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-32"/>
                    <Skeleton className="h-12 w-full"/>
                    <Skeleton className="h-3 w-40"/>
                  </div>
                </div>
              </Card>))}
          </div>) : comments.length === 0 ? (<Card className="bg-card py-16 text-center">
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageSquare className="size-8 opacity-40"/>
              <p className="text-sm">
                No {activeStatus !== "ALL" ? activeStatus.toLowerCase() : ""} comments.
              </p>
            </div>
          </Card>) : (<div className="flex flex-col gap-3">
            {comments.map((c) => (<Card key={c.id} className="bg-card p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="size-9 border border-border">
                    {c.userImage ? (<AvatarImage src={c.userImage} alt={c.userName}/>) : null}
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {initials(c.userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {c.userName}
                      </span>
                      <StatusBadge status={c.status}/>
                      <span className="text-xs text-muted-foreground">
                        {c.relativeTime}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap break-words">
                      {c.content}
                    </p>
                    {c.article ? (<Link href={`/${c.article.slug}`} target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="size-3"/>
                        {c.article.title}
                      </Link>) : (<p className="mt-2 text-xs text-muted-foreground">
                        (article removed)
                      </p>)}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {c.status !== "APPROVED" && (<Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "APPROVED")} disabled={busyId === c.id} className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-400">
                          {busyId === c.id ? (<Loader2 className="size-4 animate-spin"/>) : (<Check className="size-4"/>)}
                          Approve
                        </Button>)}
                      {c.status !== "REJECTED" && (<Button size="sm" variant="outline" onClick={() => updateStatus(c.id, "REJECTED")} disabled={busyId === c.id} className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <X className="size-4"/>
                          Reject
                        </Button>)}
                      <AlertDialog open={deleteOpen === c.id} onOpenChange={(o) => setDeleteOpen(o ? c.id : null)}>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" disabled={busyId === c.id}>
                            <Trash2 className="size-4"/>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the comment by {c.userName}. This
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(c.id)} disabled={busyId === c.id} className="bg-destructive text-white hover:bg-destructive/90">
                              {busyId === c.id ? (<Loader2 className="size-4 animate-spin"/>) : (<Trash2 className="size-4"/>)}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </Card>))}
          </div>)}
      </div>
    </div>);
}
