"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, User as UserIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
export function ProfileForm({ initial }) {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState(initial.name);
    const [bio, setBio] = useState(initial.bio);
    const [image, setImage] = useState(initial.image);
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    bio: bio.trim() || null,
                    image: image.trim() || null,
                }),
            });
            if (!res.ok) {
                const err = (await res.json().catch(() => ({})));
                throw new Error(err.error || "Failed to update profile");
            }
            toast({
                title: "Profile updated",
                description: "Your changes have been saved.",
            });
            router.refresh();
        }
        catch (err) {
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "Could not save.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    }
    const displayName = name.trim() || initial.email;
    return (<form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border border-border">
          {image ? <AvatarImage src={image} alt={displayName}/> : null}
          <AvatarFallback className="bg-muted text-lg font-semibold">
            {displayName.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{displayName}</p>
          <p className="text-xs text-muted-foreground">{initial.email}</p>
          <span className="mt-1 inline-block text-[10px] uppercase tracking-widest text-primary border border-primary/40 px-1.5 py-0.5 rounded-sm">
            {initial.role}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Display name</Label>
        <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} className="bg-background/40" placeholder="Your name"/>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image">Avatar URL</Label>
        <Input id="image" type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" className="bg-background/40"/>
        <p className="text-xs text-muted-foreground">
          Paste a direct image URL. Square images work best.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500} placeholder="A short bio…" className="bg-background/40 resize-y"/>
        <p className="text-xs text-muted-foreground">
          {bio.length}/500
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Link href="/" className="text-xs text-foreground/70 hover:text-primary">
          ← Back to site
        </Link>
        <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {loading ? (<Loader2 className="h-4 w-4 animate-spin"/>) : (<Save className="h-4 w-4"/>)}
          Save changes
        </Button>
      </div>

      <div className="text-xs text-muted-foreground flex items-center gap-2 pt-4 border-t border-border">
        <UserIcon className="h-3.5 w-3.5"/>
        Account email cannot be changed.
      </div>
    </form>);
}
