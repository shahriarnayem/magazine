"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Users as UsersIcon, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
function initials(name) {
    if (!name)
        return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1)
        return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [forbidden, setForbidden] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    // edit form state
    const [fName, setFName] = useState("");
    const [fEmail, setFEmail] = useState("");
    const [fRole, setFRole] = useState("WRITER");
    const [fBio, setFBio] = useState("");
    const [fPassword, setFPassword] = useState("");
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/users", { credentials: "include" });
            const data = await res.json();
            if (res.status === 403) {
                setForbidden(true);
                return;
            }
            if (!res.ok)
                throw new Error(data?.error || "Failed to load");
            setUsers(data.users || []);
            setCurrentUserId(data.currentUserId || null);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);
    const openEdit = (u) => {
        setEditing(u);
        setFName(u.name || "");
        setFEmail(u.email);
        setFRole(u.role === "READER" ? "WRITER" : u.role);
        setFBio(u.bio || "");
        setFPassword("");
        setEditOpen(true);
    };
    const submitEdit = async () => {
        if (!editing)
            return;
        if (!fName.trim() || !fEmail.trim()) {
            toast({
                title: "Validation",
                description: "Name and email are required.",
                variant: "destructive",
            });
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/users/${editing.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: fName.trim(),
                    email: fEmail.trim(),
                    role: fRole,
                    bio: fBio.trim() || null,
                    password: fPassword.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to save");
            toast({ title: "Saved", description: "User updated successfully." });
            setEditOpen(false);
            fetchUsers();
        }
        catch (e) {
            toast({
                title: "Error",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to delete");
            setUsers((prev) => prev.filter((u) => u.id !== id));
            toast({ title: "Deleted", description: "User removed." });
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
    if (forbidden) {
        return (<div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <ShieldAlert className="size-10 text-destructive"/>
        <h2 className="text-lg font-semibold text-foreground">Access denied</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          You need administrator privileges to view this page.
        </p>
      </div>);
    }
    return (<div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage staff accounts and their roles.
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/dashboard/users/new">
            <Plus className="size-4"/>
            New user
          </Link>
        </Button>
      </div>

      <Card className="bg-card">
        {error ? (<div className="p-6 text-sm text-destructive">Failed to load: {error}</div>) : (<Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Articles</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (Array.from({ length: 5 }).map((_, i) => (<TableRow key={i} className="border-border">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-full"/>
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-28"/>
                          <Skeleton className="h-3 w-40"/>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16"/>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-4 w-6"/>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24"/>
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Skeleton className="ml-auto h-8 w-20"/>
                    </TableCell>
                  </TableRow>))) : users.length === 0 ? (<TableRow className="border-border hover:bg-transparent">
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <UsersIcon className="size-8 opacity-40"/>
                      <p className="text-sm">No users yet.</p>
                    </div>
                  </TableCell>
                </TableRow>) : (users.map((u) => (<TableRow key={u.id} className="border-border">
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8 border border-border">
                          {u.image ? <AvatarImage src={u.image} alt={u.name || u.email}/> : null}
                          <AvatarFallback className="bg-muted text-xs font-semibold">
                            {initials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {u.name || "Unnamed"}
                            {u.id === currentUserId && (<span className="ml-2 text-xs text-primary">(you)</span>)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={u.role}/>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {u.articleCount}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.createdFormatted}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(u)} aria-label="Edit">
                          <Pencil className="size-4"/>
                        </Button>
                        <AlertDialog open={deleteOpen === u.id} onOpenChange={(o) => setDeleteOpen(o ? u.id : null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" disabled={u.id === currentUserId} aria-label="Delete">
                              <Trash2 className="size-4"/>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete user?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &quot;{u.name || u.email}&quot; and
                                all their articles. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(u.id)} disabled={deletingId === u.id} className="bg-destructive text-white hover:bg-destructive/90">
                                {deletingId === u.id ? (<Loader2 className="size-4 animate-spin"/>) : (<Trash2 className="size-4"/>)}
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

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update profile details, role, or set a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="u-name">Name</Label>
              <Input id="u-name" value={fName} onChange={(e) => setFName(e.target.value)} className="bg-background"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} className="bg-background"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select value={fRole} onValueChange={setFRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="WRITER">Writer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="u-bio">Bio</Label>
              <Textarea id="u-bio" value={fBio} onChange={(e) => setFBio(e.target.value)} rows={3} className="bg-background"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="u-pw">New password</Label>
              <Input id="u-pw" type="password" value={fPassword} onChange={(e) => setFPassword(e.target.value)} placeholder="Leave blank to keep current" className="bg-background"/>
              <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submitEdit} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin"/> : null}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
}
