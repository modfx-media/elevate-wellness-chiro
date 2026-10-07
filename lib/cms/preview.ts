import { pathHasInvalidSegments, toPublicPath } from "@/lib/cms/paths";

/** Live preview URL for a stored CMS path. Missing/invalid path → null (never `/null`). */
export function previewFromPath(path: unknown): string | null {
  if (typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return null;
  if (pathHasInvalidSegments(trimmed)) return null;
  if (trimmed !== "/" && trimmed.replace(/\/+$/, "") === "") return null;

  const secret = process.env.PREVIEW_SECRET;
  if (!secret) return null;

  const publicPath = toPublicPath(trimmed);
  const params = new URLSearchParams({
    path: publicPath,
    previewSecret: secret,
  });
  return `/next/preview?${params.toString()}`;
}
