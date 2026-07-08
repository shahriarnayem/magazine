"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Plus, Loader2, Save, Send, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BlockNoteEditorWrapper } from "@/components/dashboard/blocknote-editor";
import { ErrorBoundary } from "@/components/dashboard/error-boundary";
import { htmlToBlocksJson } from "@/lib/html-to-blocks";
export function ArticleEditor({ article, categories }) {
    const router = useRouter();
    const { toast } = useToast();
    const [title, setTitle] = useState(article?.title ?? "");
    const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
    const [contentHtml, setContentHtml] = useState(article?.contentHtml ?? "");
    const [thumbnail, setThumbnail] = useState(article?.thumbnail ?? "");
    const [categoryId, setCategoryId] = useState(article?.categoryId ?? "");
    const [tags, setTags] = useState(article?.tags ?? []);
    const [tagInput, setTagInput] = useState("");
    const [status, setStatus] = useState(article?.status ?? "DRAFT");
    const [featured, setFeatured] = useState(article?.featured ?? false);
    const [seoTitle, setSeoTitle] = useState(article?.seoTitle ?? "");
    const [seoDescription, setSeoDescription] = useState(article?.seoDescription ?? "");
    const [ogImage, setOgImage] = useState(article?.ogImage ?? "");
    const [saving, setSaving] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploadUrl, setUploadUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    // If the article prop changes (e.g. navigation), refresh local state.
    useEffect(() => {
        if (!article)
            return;
        setTitle(article.title);
        setExcerpt(article.excerpt ?? "");
        setContentHtml(article.contentHtml ?? "");
        setThumbnail(article.thumbnail ?? "");
        setCategoryId(article.categoryId ?? "");
        setTags(article.tags ?? []);
        setStatus(article.status);
        setFeatured(article.featured);
        setSeoTitle(article.seoTitle ?? "");
        setSeoDescription(article.seoDescription ?? "");
        setOgImage(article.ogImage ?? "");
    }, [article]);
    const isEdit = !!article;
    const addTag = () => {
        const t = tagInput.trim();
        if (!t)
            return;
        if (!tags.includes(t)) {
            setTags((prev) => [...prev, t]);
        }
        setTagInput("");
    };
    const removeTag = (t) => {
        setTags((prev) => prev.filter((x) => x !== t));
    };
    const handleUpload = async () => {
        if (!uploadUrl.trim())
            return;
        setUploading(true);
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ url: uploadUrl.trim() }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Upload failed");
            setThumbnail(data.url);
            setUploadUrl("");
            setUploadOpen(false);
            toast({ title: "Image added", description: "Thumbnail updated." });
        }
        catch (e) {
            toast({
                title: "Upload failed",
                description: e instanceof Error ? e.message : "Unknown error",
                variant: "destructive",
            });
        }
        finally {
            setUploading(false);
        }
    };
    const buildPayload = (target) => {
        let finalStatus = status;
        if (target === "DRAFT")
            finalStatus = "DRAFT";
        if (target === "PUBLISHED")
            finalStatus = "PUBLISHED";
        return {
            title: title.trim(),
            excerpt: excerpt.trim() || undefined,
            // Canonical content is the editor HTML; we also keep a BlockNote-schema
            // JSON representation so the content model stays portable.
            contentHtml: contentHtml || undefined,
            contentJson: contentHtml
                ? htmlToBlocksJson(contentHtml)
                : article?.contentJson ?? undefined,
            thumbnail: thumbnail.trim() || undefined,
            categoryId: categoryId || undefined,
            tags,
            status: finalStatus,
            featured,
            seoTitle: seoTitle.trim() || undefined,
            seoDescription: seoDescription.trim() || undefined,
            ogImage: ogImage.trim() || undefined,
        };
    };
    const save = async (target) => {
        if (!title.trim()) {
            toast({
                title: "Title required",
                description: "Please add a title before saving.",
                variant: "destructive",
            });
            return;
        }
        setSaving(true);
        const payload = buildPayload(target);
        try {
            const url = isEdit ? `/api/articles/${article.id}` : "/api/articles";
            const method = isEdit ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data?.error || "Save failed");
            // Sync local status if user clicked Publish/Draft
            if (target === "PUBLISHED")
                setStatus("PUBLISHED");
            if (target === "DRAFT")
                setStatus("DRAFT");
            toast({
                title: isEdit ? "Article updated" : "Article created",
                description: target === "PUBLISHED"
                    ? "Published successfully."
                    : target === "DRAFT"
                        ? "Saved as draft."
                        : "Saved successfully.",
            });
            router.push("/dashboard/articles");
            router.refresh();
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
    const livePreviewUrl = useMemo(() => (article?.slug ? `/${article.slug}` : null), [article?.slug]);
    return (<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      {/* MAIN EDITOR */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? "Edit Article" : "New Article"}
          </h1>
          {livePreviewUrl && (<Button asChild variant="ghost" size="sm">
              <Link href={livePreviewUrl} target="_blank">
                <ExternalLink className="size-4"/>
                Preview
              </Link>
            </Button>)}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title" className="text-muted-foreground">
            Title
          </Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="An evocative headline…" className="h-12 border-border bg-card text-lg font-semibold" autoFocus={!isEdit}/>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="excerpt" className="text-muted-foreground">
            Excerpt <span className="text-xs">(optional — auto-generated if empty)</span>
          </Label>
          <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="A short summary that appears in listings." className="bg-card" rows={2}/>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-muted-foreground">Content</Label>
          <ErrorBoundary fallback={<div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
                <p className="font-semibold text-destructive">
                  Couldn&apos;t load the content editor.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your saved content is preserved. Reload the page to try again.
                </p>
              </div>}>
            <BlockNoteEditorWrapper initialContentHtml={article?.contentHtml} initialContentJson={article?.contentJson} onChange={(html) => setContentHtml(html)}/>
          </ErrorBoundary>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="flex flex-col gap-4">
        {/* Save actions */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Save</h2>
            {isEdit && (<Badge variant="outline" className="text-[10px] text-muted-foreground">
                Current: {status}
              </Badge>)}
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={() => save(isEdit ? "CURRENT" : "DRAFT")} disabled={saving} variant="outline" className="w-full justify-start">
              {saving ? (<Loader2 className="size-4 animate-spin"/>) : (<Save className="size-4"/>)}
              {isEdit ? "Update" : "Save Draft"}
            </Button>
            {!isEdit && (<Button onClick={() => save("DRAFT")} disabled={saving} variant="outline" className="w-full justify-start">
                <Save className="size-4"/>
                Save as Draft
              </Button>)}
            <Button onClick={() => save("PUBLISHED")} disabled={saving} className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
              <Send className="size-4"/>
              {status === "PUBLISHED" ? "Republish" : "Publish"}
            </Button>
          </div>
        </div>

        {/* Status & visibility */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Status & Visibility
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label className="text-sm text-foreground">Featured</Label>
                <span className="text-xs text-muted-foreground">
                  Show on homepage hero
                </span>
              </div>
              <Switch checked={featured} onCheckedChange={setFeatured}/>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Category</h2>
          <Select value={categoryId || "__none__"} onValueChange={(v) => setCategoryId(v === "__none__" ? "" : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Uncategorized"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Uncategorized</SelectItem>
              {categories.map((c) => (<SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Tags</h2>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addTag();
            }
        }} placeholder="Type a tag and press Enter" className="bg-background"/>
            <Button type="button" size="icon" variant="outline" onClick={addTag} aria-label="Add tag">
              <Plus className="size-4"/>
            </Button>
          </div>
          {tags.length > 0 && (<div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((t) => (<Badge key={t} variant="secondary" className="gap-1 bg-secondary text-secondary-foreground">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="ml-1 text-muted-foreground hover:text-destructive" aria-label={`Remove ${t}`}>
                    <X className="size-3"/>
                  </button>
                </Badge>))}
            </div>)}
        </div>

        {/* Thumbnail */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Thumbnail</h2>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary">
                  <ImageIcon className="size-4"/>
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add image via URL</DialogTitle>
                  <DialogDescription>
                    Paste a direct image URL. Cloudinary passthrough is used when
                    not configured.
                  </DialogDescription>
                </DialogHeader>
                <Input value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://…/image.jpg" autoFocus/>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading || !uploadUrl.trim()}>
                    {uploading ? <Loader2 className="size-4 animate-spin"/> : null}
                    Add image
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="Image URL" className="bg-background"/>
          {thumbnail ? (<img src={thumbnail} alt="Thumbnail preview" className="mt-3 aspect-video w-full rounded-md border border-border object-cover"/>) : (<div className="mt-3 flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
              No thumbnail
            </div>)}
        </div>

        {/* SEO */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            SEO
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">SEO Title</Label>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Defaults to article title" className="bg-background"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">SEO Description</Label>
              <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Defaults to excerpt" rows={2} className="bg-background"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">OG Image URL</Label>
              <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="Defaults to thumbnail" className="bg-background"/>
            </div>
          </div>
        </div>
      </aside>
    </div>);
}
