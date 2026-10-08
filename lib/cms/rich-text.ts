function nodeHasContent(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  const record = node as {
    type?: string;
    text?: string;
    children?: unknown[];
    value?: unknown;
  };
  if (record.type === "upload" || record.type === "horizontalrule") return true;
  if (typeof record.text === "string" && record.text.trim()) return true;
  if (Array.isArray(record.children) && record.children.some((child) => nodeHasContent(child))) {
    return true;
  }
  return false;
}

export function hasRichText(data: unknown): data is { root: { children: unknown[] } } {
  if (!data || typeof data !== "object") return false;
  const root = (data as { root?: { children?: unknown[] } }).root;
  if (!root?.children?.length) return false;
  return root.children.some((child) => nodeHasContent(child));
}
