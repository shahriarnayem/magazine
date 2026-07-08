"use client";
/* eslint-disable react-hooks/refs -- all ref access happens inside event-handler
   closures (onClick/onInput/onBlur), never during render. The react-hooks/refs
   rule over-flags the toolbar array that captures those handlers. */
import { useEffect, useRef, useCallback } from "react";
import { Bold, Italic, Underline, Strikethrough, Heading2, Heading3, Quote, List, ListOrdered, Link as LinkIcon, Code, Image as ImageIcon, Undo2, Redo2, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blocksJsonToHtml } from "@/lib/blocknote";
import { cn } from "@/lib/utils";
/**
 * Lightweight WYSIWYG content editor.
 *
 * The article content model is BlockNote-schema block JSON (stored in
 * `contentJson`) plus a pre-rendered HTML string (`contentHtml`) that the public
 * article page renders via `.article-prose`. This editor edits the HTML directly
 * with a formatting toolbar (bold/italic/headings/quote/lists/link/code/image)
 * using `document.execCommand`, then the parent converts the HTML back to
 * BlockNote JSON via `htmlToBlocksJson` for storage.
 *
 * A full BlockNote React view (@blocknote/react + @blocknote/mantine) is too heavy
 * to compile in memory-constrained environments (it transitively bundles
 * emoji-mart + react-icons ≈ 110MB), so this dependency-free editor preserves the
 * BlockNote content model while staying light.
 */
export function BlockNoteEditorWrapper({ initialContentJson, initialContentHtml, onChange, editable = true, }) {
    const ref = useRef(null);
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    });
    // Seed initial HTML once.
    useEffect(() => {
        if (!ref.current)
            return;
        const html = initialContentHtml && initialContentHtml.trim()
            ? initialContentHtml
            : blocksJsonToHtml(initialContentJson);
        ref.current.innerHTML = html || "<p><br/></p>";
    }, []);
    const emit = useCallback(() => {
        if (!ref.current)
            return;
        onChangeRef.current?.(ref.current.innerHTML);
    }, []);
    const exec = (command, value) => {
        document.execCommand(command, false, value);
        ref.current?.focus();
        emit();
    };
    const formatBlock = (tag) => {
        document.execCommand("formatBlock", false, tag);
        ref.current?.focus();
        emit();
    };
    const addLink = () => {
        const url = window.prompt("Enter URL");
        if (url)
            exec("createLink", url);
    };
    const addImage = () => {
        const url = window.prompt("Image URL");
        if (url) {
            document.execCommand("insertImage", false, url);
            ref.current?.focus();
            emit();
        }
    };
    const insertCodeBlock = () => {
        const sel = window.getSelection();
        const text = sel?.toString() || "";
        const code = text || "// code";
        document.execCommand("insertHTML", false, `<pre data-language="text"><code>${code.replace(/</g, "&lt;")}</code></pre><p><br/></p>`);
        ref.current?.focus();
        emit();
    };
    const tools = [
        { icon: Bold, action: () => exec("bold"), label: "Bold" },
        { icon: Italic, action: () => exec("italic"), label: "Italic" },
        { icon: Underline, action: () => exec("underline"), label: "Underline" },
        { icon: Strikethrough, action: () => exec("strikeThrough"), label: "Strikethrough" },
        { icon: Heading2, action: () => formatBlock("<h2>"), label: "Heading 2" },
        { icon: Heading3, action: () => formatBlock("<h3>"), label: "Heading 3" },
        { icon: Quote, action: () => formatBlock("<blockquote>"), label: "Quote" },
        { icon: List, action: () => exec("insertUnorderedList"), label: "Bullet list" },
        { icon: ListOrdered, action: () => exec("insertOrderedList"), label: "Numbered list" },
        { icon: Code, action: insertCodeBlock, label: "Code block" },
        { icon: LinkIcon, action: addLink, label: "Link" },
        { icon: ImageIcon, action: addImage, label: "Image" },
    ];
    return (<div className="rounded-md border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/40 p-2">
        {tools.map((t, i) => (<Button key={i} type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground hover:bg-accent" onClick={t.action} title={t.label} aria-label={t.label}>
            <t.icon className="size-4"/>
          </Button>))}
        <div className="mx-1 h-5 w-px bg-border"/>
        <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => exec("undo")} title="Undo" aria-label="Undo">
          <Undo2 className="size-4"/>
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => exec("redo")} title="Redo" aria-label="Redo">
          <Redo2 className="size-4"/>
        </Button>
      </div>

      {/* Editable area */}
      <div ref={ref} contentEditable={editable} suppressContentEditableWarning onInput={emit} onBlur={emit} className={cn("article-prose min-h-[320px] max-w-none px-5 py-4 outline-none", "[&_p:first-child]:mt-0", "[&_ul]:list-disc [&_ol]:list-decimal", "focus:outline-none")} spellCheck={false}/>
    </div>);
}
