"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderTree, Loader2, ShieldAlert, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
export default function CategoriesPage() {
    const { toast } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [forbidden, setForbidden] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(null);
    const [busy, setBusy] = useState(false);
    // form state
    const [fName, setFName] = useState("");
    const [fDesc, setFDesc] = useState("");
    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/categories", { credentials: "include" });
            const data = await res.json();
            if (res.status === 403) {
                setForbidden(true);
                return;
            }
            if (!res.ok)
                throw new Error(data?.error || "Failed to load");
            setCategories(data.categories || []);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);
    const openCreate = () => {
        setFName("");
        setFDesc("");
        setCreateOpen(true);
    };
    const openEdit = (c) => {
        setEditing(c);
        setFName(c.name);
        setFDesc(c.description || "");
        setEditOpen(true);
    };
    const submitCreate = async () => {
        if (!fName.trim()) {
            toast({
                title: "Validation",
                description: "Name is required.",
                variant: "destructive",
            });
            return;
        }
        setBusy(true);
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: fName.trim(),
                    description: fDesc.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to create");
            toast({ title: "Created", description: "Category added." });
            setCreateOpen(false);
            fetchCategories();
        }
        catch (e) {
            toast({
                title: "Error",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setBusy(false);
        }
    };
    const submitEdit = async () => {
        if (!editing)
            return;
        if (!fName.trim()) {
            toast({
                title: "Validation",
                description: "Name is required.",
                variant: "destructive",
            });
            return;
        }
        setBusy(true);
        try {
            const res = await fetch(`/api/categories/${editing.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: fName.trim(),
                    description: fDesc.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to save");
            toast({ title: "Saved", description: "Category updated." });
            setEditOpen(false);
            fetchCategories();
        }
        catch (e) {
            toast({
                title: "Error",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setBusy(false);
        }
    };
    const handleDelete = async (id) => {
        setBusy(true);
        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to delete");
            setCategories((prev) => prev.filter((c) => c.id !== id));
            toast({ title: "Deleted", description: "Category removed." });
        }
        catch (e) {
            toast({
                title: "Error",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setBusy(false);
            setDeleteOpen(null);
        }
    };
    if (forbidden) {
        return (<div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <ShieldAlert className="size-10 text-destructive"/>
        <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          You need administrator privileges to manage categories.
        </p>
      </div>);
    }
    return (<div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Organize articles into sections.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="size-4"/>
          New category
        </Button>
      </div>

      <Card className="bg-card">
        {error ? (<div className="p-6 text-sm text-destructive">Failed to load: {error}</div>) : (<Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Articles</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (Array.from({ length: 4 }).map((_, i) => (<TableRow key={i} className="border-border">
                    <TableCell className="pl-4">
                      <Skeleton className="h-4 w-32"/>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24"/>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48"/>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-6"/>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Skeleton className="ml-auto h-8 w-20"/>
                    </TableCell>
                  </TableRow>))) : categories.length === 0 ? (<TableRow className="border-border hover:bg-transparent">
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <FolderTree className="size-8 opacity-40"/>
                      <p className="text-sm">No categories yet.</p>
                      <Button onClick={openCreate} variant="outline" size="sm">
                        <Plus className="size-4"/>
                        Add one
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>) : (categories.map((c) => (<TableRow key={c.id} className="border-border">
                    <TableCell className="pl-4 font-medium text-foreground">
                      {c.name}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {c.slug}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-[360px]">
                      <span className="line-clamp-2 text-sm text-muted-foreground">
                        {c.description || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="text-muted-foreground">
                        {c.articleCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(c)} aria-label="Edit">
                          <Pencil className="size-4"/>
                        </Button>
                        <AlertDialog open={deleteOpen === c.id} onOpenChange={(o) => setDeleteOpen(o ? c.id : null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" aria-label="Delete">
                              <Trash2 className="size-4"/>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Deleting &quot;{c.name}&quot; will leave its {c.articleCount}{" "}
                                article{c.articleCount === 1 ? "" : "s"} uncategorized.
                                This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(c.id)} disabled={busy} className="bg-destructive text-white hover:bg-destructive/90">
                                {busy ? (<Loader2 className="size-4 animate-spin"/>) : (<Trash2 className="size-4"/>)}
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

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
            <DialogDescription>
              Slug is auto-generated from the name.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="e.g. Technology" className="bg-background"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-desc">Description</Label>
              <Textarea id="c-desc" value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={3} placeholder="Short description (optional)" className="bg-background"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submitCreate} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin"/> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
            <DialogDescription>
              {editing ? `Slug: ${editing.slug}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e-name">Name</Label>
              <Input id="e-name" value={fName} onChange={(e) => setFName(e.target.value)} className="bg-background"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="e-desc">Description</Label>
              <Textarea id="e-desc" value={fDesc} onChange={(e) => setFDesc(e.target.value)} rows={3} className="bg-background"/>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin"/> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
}
