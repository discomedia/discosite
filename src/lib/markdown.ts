import { marked } from "marked";

marked.use({
  gfm: true,
  breaks: false,
});

const allowedTags = [
  "a",
  "blockquote",
  "br",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "hr",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
];

const allowedTagSet = new Set(allowedTags);
const allowedAttributes = new Map<string, Set<string>>([["a", new Set(["href", "name", "target", "rel"])]]);
const allowedSchemes = ["http:", "https:", "mailto:"];

export function renderMarkdown(markdown: string): string {
  const raw = marked.parse(markdown, { async: false });
  if (typeof DOMParser === "undefined") {
    return String(raw)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "");
  }

  const doc = new DOMParser().parseFromString(String(raw), "text/html");
  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}

function sanitizeNode(root: ParentNode): void {
  for (const element of Array.from(root.children)) {
    const tag = element.tagName.toLowerCase();

    if (!allowedTagSet.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      sanitizeNode(root);
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      const allowed = allowedAttributes.get(tag);
      if (!allowed?.has(attribute.name)) {
        element.removeAttribute(attribute.name);
      }
    }

    if (tag === "a") {
      const href = element.getAttribute("href");
      if (href) {
        try {
          const url = new URL(href, "https://discomedia.co");
          if (!allowedSchemes.includes(url.protocol)) element.removeAttribute("href");
        } catch {
          element.removeAttribute("href");
        }
      }
    }

    sanitizeNode(element);
  }
}
