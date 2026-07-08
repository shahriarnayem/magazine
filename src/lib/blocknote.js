/**
 * BlockNote content rendering helper.
 *
 * Articles store content as BlockNote block JSON (`contentJson`) plus a
 * pre-rendered HTML string (`contentHtml`) produced at save time. The public
 * article page renders the HTML via `article-prose` styles — never raw JSON.
 *
 * This module contains a dependency-light converter that maps the common
 * BlockNote block types to semantic HTML. It runs on the server (Node) only.
 */
function escapeHtml(s) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function renderInline(items) {
    if (!items)
        return "";
    return items
        .map((item) => {
        if (item.type === "link") {
            const inner = renderInline(item.content);
            return `<a href="${escapeHtml(item.href)}">${inner}</a>`;
        }
        let text = escapeHtml(item.text || "");
        const st = item.styles || {};
        if (st.code)
            text = `<code>${text}</code>`;
        if (st.bold)
            text = `<strong>${text}</strong>`;
        if (st.italic)
            text = `<em>${text}</em>`;
        if (st.underline)
            text = `<u>${text}</u>`;
        if (st.strike)
            text = `<s>${text}</s>`;
        if (st.link)
            text = `<a href="${escapeHtml(st.link)}">${text}</a>`;
        return text;
    })
        .join("");
}
function blockToHtml(block) {
    const content = renderInline(block.content);
    switch (block.type) {
        case "heading": {
            const level = Number(block.props?.level || 2);
            const tag = Math.min(Math.max(level, 1), 6);
            return `<h${tag}>${content}</h${tag}>`;
        }
        case "quote":
            return `<blockquote>${content}${block.children ? renderBlocks(block.children) : ""}</blockquote>`;
        case "code": {
            const code = block.props?.code || "";
            const lang = block.props?.language || "";
            return `<pre data-language="${escapeHtml(lang)}"><code>${escapeHtml(code)}</code></pre>`;
        }
        case "codeBlock": {
            // BlockNote 0.51+ stores code as inline text content under a codeBlock.
            const lang = block.props?.language || "";
            const code = content || block.props?.code || "";
            return `<pre data-language="${escapeHtml(lang)}"><code>${escapeHtml(code.replace(/<[^>]+>/g, ""))}</code></pre>`;
        }
        case "image": {
            const url = block.props?.url || "";
            const alt = block.props?.caption || "";
            const caption = block.props?.caption;
            if (!url)
                return "";
            return `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`;
        }
        case "video": {
            const url = block.props?.url || "";
            if (!url)
                return "";
            return `<div class="video-embed"><a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a></div>`;
        }
        case "bulletListItem":
            return `<li>${content}${block.children ? `<ul>${renderBlocks(block.children)}</ul>` : ""}</li>`;
        case "numberedListItem":
            return `<li>${content}${block.children ? `<ol>${renderBlocks(block.children)}</ol>` : ""}</li>`;
        case "table": {
            // Basic table rendering
            return `<div class="table-wrap">${content}</div>`;
        }
        case "paragraph":
        default:
            return `<p>${content || "<br/>"}</p>`;
    }
}
export function renderBlocks(blocks) {
    let html = "";
    let i = 0;
    while (i < blocks.length) {
        const block = blocks[i];
        // Group list items into <ul>/<ol>
        if (block.type === "bulletListItem") {
            let group = "";
            while (i < blocks.length && blocks[i].type === "bulletListItem") {
                group += blockToHtml(blocks[i]);
                i++;
            }
            html += `<ul>${group}</ul>`;
            continue;
        }
        if (block.type === "numberedListItem") {
            let group = "";
            while (i < blocks.length && blocks[i].type === "numberedListItem") {
                group += blockToHtml(blocks[i]);
                i++;
            }
            html += `<ol>${group}</ol>`;
            continue;
        }
        html += blockToHtml(block);
        i++;
    }
    return html;
}
/** Convert a BlockNote JSON string into HTML for storage / display. */
export function blocksJsonToHtml(json) {
    if (!json)
        return "";
    let blocks;
    try {
        const parsed = JSON.parse(json);
        blocks = Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return "";
    }
    if (blocks.length === 0)
        return "";
    try {
        return renderBlocks(blocks);
    }
    catch {
        return "";
    }
}
/** Parse + validate BlockNote JSON. Returns null if invalid. */
export function parseBlocksJson(json) {
    if (!json)
        return null;
    try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed))
            return parsed;
        return null;
    }
    catch {
        return null;
    }
}
/** A minimal starter document for a fresh article. */
export function emptyBlockNoteDoc() {
    return JSON.stringify([
        {
            type: "paragraph",
            content: [{ type: "text", text: "", styles: {} }],
        },
    ]);
}
