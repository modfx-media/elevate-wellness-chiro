import { SITE_URL } from "@/lib/constants";

function stripSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function isLocalhost(value: string): boolean {
  try {
    const host = new URL(value).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return value.includes("localhost") || value.includes("127.0.0.1");
  }
}

/** Public origin for Payload `serverURL`. On Vercel, ignore a copied localhost value. */
export function getServerURL(): string {
  const onVercel = Boolean(process.env.VERCEL);
  const raw = process.env.NEXT_PUBLIC_SERVER_URL;
  if (raw && !(onVercel && isLocalhost(raw))) return stripSlash(raw);

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site && !(onVercel && isLocalhost(site))) return stripSlash(site);

  return SITE_URL;
}

export function getCorsOrigins(): string[] {
  const origins = new Set<string>([
    SITE_URL,
    "https://elevatewellnesschiro.com",
    getServerURL(),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);
  if (process.env.VERCEL_URL) origins.add(`https://${process.env.VERCEL_URL}`);
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    origins.add(stripSlash(process.env.NEXT_PUBLIC_SERVER_URL));
  }
  return [...origins].filter(Boolean);
}
