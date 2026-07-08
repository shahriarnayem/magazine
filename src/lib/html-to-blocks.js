/**
 * Lightweight HTML → BlockNote-schema JSON converter.
 *
 * The dashboard editor is a contenteditable WYSIWYG that produces HTML. To keep
 * the canonical article storage as BlockNote-schema block JSON (so it round-trips
 * with `blocksJsonToHtml` and stays portable to a full BlockNote view), we convert
 * the editor's HTML into blocks on the client (where DOMParser is available).
 *
 * Handles the common block/inline types produced by the editor toolbar:
 * paragraph, heading (1-6), quote, codeBlock, image, bullet/numbered list items,
 * and inline bold/italic/underline/strike/link/code.
 */
function collectInline(node, styles) {
    const out = [];
    node.childNodes.forEach((child) => {
        if (child.nodeType === 3 /* TEXT */) {
            const text = child.textContent || "";
            if (text)
                out.push({ type: "text", text, styles: { ...styles } });
            return;
        }
        if (child.nodeType !== 1 /* ELEMENT */)
            return;
        const el = child;
        const tag = el.tagName.toLowerCase();
        const next = { ...styles };
        if (tag === "strong" || tag === "b")
            next.bold = true;
        if (tag === "em" || tag === "i")
            next.italic = true;
        if (tag === "u")
            next.underline = true;
        if (tag === "s" || tag === "del" || tag === "strike")
            next.strike = true;
        if (tag === "code")
            next.code = true;
        if (tag === "a")
            next.link = el.getAttribute("href") || undefined;
        if (tag === "br") {
            out.push({ type: "text", text: "\n", styles: { ...styles } });
            return;
        }
        out.push(...collectInline(el, next));
    });
    return out;
}
function parseList(el, ordered) {
    const blocks = [];
    el.querySelectorAll(":scope > li").forEach((li) => {
        const content = collectInline(li, {});
        blocks.push({
            type: ordered ? "numberedListItem" : "bulletListItem",
            content: content.length ? content : [{ type: "text", text: "", styles: {} }],
        });
    });
    return blocks;
}
export function htmlToBlocksJson(html) {
    if (!html || !html.trim()) {
        return JSON.stringify([
            { type: "paragraph", content: [{ type: "text", text: "", styles: {} }] },
        ]);
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.body.firstChild;
    const blocks = [];
    root.childNodes.forEach((node) => {
        if (node.nodeType === 3) {
            const text = node.textContent || "";
            if (text.trim()) {
                blocks.push({
                    type: "paragraph",
                    content: [{ type: "text", text, styles: {} }],
                });
            }
            return;
        }
        if (node.nodeType !== 1)
            return;
        const el = node;
        const tag = el.tagName.toLowerCase();
        switch (tag) {
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
                blocks.push({
                    type: "heading",
                    props: { level: Number(tag.slice(1)) },
                    content: collectInline(el, {}),
                });
                break;
            case "blockquote":
                blocks.push({ type: "quote", content: collectInline(el, {}) });
                break;
            case "pre": {
                const code = el.textContent || "";
                const lang = el.getAttribute("data-language") || "text";
                blocks.push({
                    type: "codeBlock",
                    props: { language: lang },
                    content: [{ type: "text", text: code, styles: {} }],
                });
                break;
            }
            case "ul":
                blocks.push(...parseList(el, false));
                break;
            case "ol":
                blocks.push(...parseList(el, true));
                break;
            case "img": {
                const url = el.getAttribute("src") || "";
                const caption = el.getAttribute("alt") || "";
                if (url) {
                    blocks.push({
                        type: "image",
                        props: { url, caption, showCaption: !!caption },
                    });
                }
                break;
            }
            case "figure": {
                const img = el.querySelector("img");
                const cap = el.querySelector("figcaption")?.textContent || "";
                if (img) {
                    blocks.push({
                        type: "image",
                        props: {
                            url: img.getAttribute("src") || "",
                            caption: cap,
                            showCaption: !!cap,
                        },
                    });
                }
                break;
            }
            case "p":
            default: {
                const content = collectInline(el, {});
                if (tag === "p" && content.length === 0) {
                    blocks.push({
                        type: "paragraph",
                        content: [{ type: "text", text: "", styles: {} }],
                    });
                }
                else {
                    blocks.push({ type: "paragraph", content });
                }
                break;
            }
        }
    });
    if (blocks.length === 0) {
        blocks.push({
            type: "paragraph",
            content: [{ type: "text", text: "", styles: {} }],
        });
    }
    return JSON.stringify(blocks);
}
