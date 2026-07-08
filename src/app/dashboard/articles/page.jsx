"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
function StatusBadge({ status }) {
    if (status === "PUBLISHED") {
        return (<Badge className="bg-primary/15 text-primary border border-primary/30">
        Published
      </Badge>);
    }
    if (status === "DRAFT") {
        return (<Badge variant="secondary" className="text-muted-foreground">
        Draft
      </Badge>);
    }
    return (<Badge variant="secondary" className="text-muted-foreground">
      Archived
    </Badge>);
}
export default function ArticlesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [query, setQuery] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(null);
    const fetchArticles = async (status, q) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (status !== "ALL")
                params.set("status", status);
            if (q.trim())
                params.set("q", q.trim());
            const url = `/api/dashboard/articles${params.toString() ? `?${params}` : ""}`;
            const res = await fetch(url, { credentials: "include" });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to load");
            setArticles(data.articles || []);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchArticles(statusFilter, query);
    }, [statusFilter]);
    // debounce query
    useEffect(() => {
        const t = setTimeout(() => fetchArticles(statusFilter, query), 300);
        return () => clearTimeout(t);
    }, [query]);
    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/articles/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to delete");
            setArticles((prev) => prev.filter((a) => a.id !== id));
            toast({ title: "Deleted", description: "Article removed." });
        }
        catch (e) {
            toast({
                title: "Error",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setDeletingId(null);
            setDeleteOpen(null);
        }
    };
    const stats = useMemo(() => {
        return {
            total: articles.length,
            published: articles.filter((a) => a.status === "PUBLISHED").length,
            drafts: articles.filter((a) => a.status === "DRAFT").length,
        };
    }, [articles]);
    return (<div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Articles
          </h1>
          <p className="text-sm text-muted-foreground">
            {loading
            ? "Loading…"
            : `${stats.total} total · ${stats.published} published · ${stats.drafts} draft`}
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/dashboard/articles/new">
            <Plus className="size-4"/>
            New article
          </Link>
        </Button>
      </div>

      <Card className="bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title or excerpt…" className="pl-9 bg-background"/>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="bg-card">
        {error ? (<div className="p-6 text-sm text-destructive">
            Failed to load articles: {error}
          </div>) : (<Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-4">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (Array.from({ length: 6 }).map((_, i) => (<TableRow key={i} className="border-border">
                    <TableCell className="pl-4">
                      <Skeleton className="h-4 w-48"/>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16"/>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20"/>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-10"/>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24"/>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Skeleton className="ml-auto h-8 w-20"/>
                    </TableCell>
                  </TableRow>))) : articles.length === 0 ? (<TableRow className="border-border hover:bg-transparent">
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <FileText className="size-8 opacity-40"/>
                      <p className="text-sm">No articles found.</p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/articles/new">
                          <Plus className="size-4"/>
                          Create one
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>) : (articles.map((a) => (<TableRow key={a.id} className="border-border">
                    <TableCell className="pl-4 max-w-[420px]">
                      <Link href={`/dashboard/articles/${a.id}/edit`} className="block truncate font-medium text-foreground hover:text-primary" title={a.title}>
                        {a.title}
                        {a.featured && (<Badge className="ml-2 bg-primary/15 text-primary border border-primary/30">
                            Featured
                          </Badge>)}
                      </Link>
                      <p className="text-xs text-muted-foreground">by {a.authorName}</p>
                    </TableCell>
                    <TableCell>
                      {a.category ? (<Badge variant="outline" className="text-muted-foreground">
                          {a.category.name}
                        </Badge>) : (<span className="text-xs text-muted-foreground">—</span>)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={a.status}/>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {a.views.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {a.updatedFormatted}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" aria-label="Edit">
                          <Link href={`/dashboard/articles/${a.id}/edit`}>
                            <Pencil className="size-4"/>
                          </Link>
                        </Button>
                        <AlertDialog open={deleteOpen === a.id} onOpenChange={(o) => setDeleteOpen(o ? a.id : null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" aria-label="Delete">
                              <Trash2 className="size-4"/>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete article?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &quot;{a.title}&quot;. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(a.id)} disabled={deletingId === a.id} className="bg-destructive text-white hover:bg-destructive/90">
                                {deletingId === a.id ? (<Loader2 className="size-4 animate-spin"/>) : (<Trash2 className="size-4"/>)}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>)))}
            </TableBody>
          </Table>)}
      </Card>
    </div>);
}
