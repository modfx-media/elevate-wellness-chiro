const BLOB_HOST = /(^|\.)public\.blob\.vercel-storage\.com$/;

export type CmsUpload = {
  url?: string | null;
  alt?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
};

/** Public URL for an uploaded media doc. Local `/media` paths 404 on Vercel. */
export function uploadPublicUrl(media: unknown): { url: string; alt: string } | null {
  if (!media || typeof media !== "object") return null;
  const record = media as CmsUpload;
  const url = record.url?.trim();
  if (!url) return null;
  if (url.startsWith("/media/") || url.startsWith("/api/media")) return null;
  if (url.startsWith("/")) return { url, alt: record.alt || "" };
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && BLOB_HOST.test(parsed.hostname)) {
      return { url, alt: record.alt || "" };
    }
  } catch {
    return null;
  }
  return null;
}
