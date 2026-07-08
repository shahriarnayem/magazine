"use client";
import { useEffect, useState } from "react";
import { Loader2, Save, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
export default function ProfilePage() {
    const { toast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [image, setImage] = useState("");
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/auth/me", { credentials: "include" });
                const data = await res.json();
                if (!res.ok)
                    throw new Error(data?.error || "Failed to load");
                const u = data.user;
                if (u) {
                    setProfile(u);
                    setName(u.name || "");
                    setBio(u.bio || "");
                    setImage(u.image || "");
                }
            }
            catch (e) {
                toast({
                    title: "Error",
                    description: e instanceof Error ? e.message : "Unknown error",
                    variant: "destructive",
                });
            }
            finally {
                setLoading(false);
            }
        })();
    }, [toast]);
    const submit = async () => {
        if (!name.trim()) {
            toast({
                title: "Validation",
                description: "Name cannot be empty.",
                variant: "destructive",
            });
            return;
        }
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: name.trim(),
                    bio: bio.trim() || null,
                    image: image.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Failed to save");
            setProfile(data.user);
            toast({ title: "Saved", description: "Profile updated successfully." });
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
    if (loading || !profile) {
        return (<div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-40"/>
          <Skeleton className="mt-2 h-4 w-64"/>
        </div>
        <Card className="bg-card">
          <CardContent className="flex flex-col gap-4 py-6">
            <Skeleton className="h-10 w-full"/>
            <Skeleton className="h-10 w-full"/>
            <Skeleton className="h-24 w-full"/>
            <Skeleton className="ml-auto h-9 w-32"/>
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your personal information.
        </p>
      </div>

      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="size-14 border border-border">
            {profile.image ? (<AvatarImage src={profile.image} alt={profile.name || profile.email}/>) : null}
            <AvatarFallback className="bg-muted text-base font-semibold">
              {initials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-semibold text-foreground">
              {profile.name || "Unnamed"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{profile.email}</span>
              <RoleBadge role={profile.role}/>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-background"/>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-email">Email</Label>
            <Input id="p-email" value={profile.email} disabled className="bg-muted/40 text-muted-foreground"/>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed from this page.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-image">Avatar URL</Label>
            <div className="flex gap-2">
              <Input id="p-image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…/avatar.jpg" className="bg-background"/>
              {image ? (<img src={image} alt="Avatar preview" className="size-9 shrink-0 rounded-full border border-border object-cover"/>) : (<div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                  <UserCircle className="size-5"/>
                </div>)}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-bio">Bio</Label>
            <Textarea id="p-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell readers about yourself…" className="bg-background"/>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={submit} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? <Loader2 className="size-4 animate-spin"/> : <Save className="size-4"/>}
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>);
}
