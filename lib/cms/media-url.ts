const BLOB_HOST = /(^|\.)public\.blob\.vercel-storage\.com$/;
const OWN_HOST = /(^|\.)elevatewellnesschiro\.com$/;
/** Local Payload disk paths. They 404 on Vercel; Blob URLs are the public file. */
const LOCAL_MEDIA = /^\/(?:media|api\/media)(?:\/|$)/;

export type CmsUpload = {
  url?: string | null;
  alt?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  sizes?: Record<string, { url?: string | null } | null> | null;
};

/** Public URL for an uploaded media doc. Local `/media` paths 404 on Vercel. */
export function uploadPublicUrl(media: unknown): { url: string; alt: string } | null {
  if (!media) return null;
  if (typeof media === "string") return fromUrl(media, "");
  if (typeof media !== "object") return null;

  const record = media as CmsUpload;
  const alt = record.alt || "";
  const candidates = [record.url, ...sizeUrls(record.sizes)];
  for (const candidate of candidates) {
    const resolved = fromUrl(candidate, alt);
    if (resolved) return resolved;
  }
  return null;
}

function sizeUrls(sizes: CmsUpload["sizes"]): Array<string | null | undefined> {
  if (!sizes) return [];
  return Object.values(sizes).map((size) => size?.url);
}

function fromUrl(raw: string | null | undefined, alt: string): { url: string; alt: string } | null {
  const url = raw?.trim();
  if (!url) return null;
  if (url.startsWith("/")) {
    if (LOCAL_MEDIA.test(url)) return null;
    return { url, alt };
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    if (BLOB_HOST.test(parsed.hostname)) return { url, alt };
    if (OWN_HOST.test(parsed.hostname)) {
      const path = parsed.pathname || "/";
      if (LOCAL_MEDIA.test(path)) return null;
      return { url: path, alt };
    }
  } catch {
    return null;
  }
  return null;
}
