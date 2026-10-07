import { SITE_URL } from "@/lib/constants";

const LOCALHOST = /localhost|127\.0\.0\.1/i;

function stripSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function isLocalhost(value: string): boolean {
  return LOCALHOST.test(value);
}

/**
 * Public origin for Payload `serverURL`.
 * Never prefer a localhost `NEXT_PUBLIC_SERVER_URL` when a public site URL exists
 * (covers Vercel mis-copies and client bundles where `process.env.VERCEL` is absent).
 */
export function getServerURL(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL;
  if (raw && !isLocalhost(raw)) return stripSlash(raw);

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site && !isLocalhost(site)) return stripSlash(site);

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Local dev only — SITE_URL is the live www canonical and is always public.
  if (raw) return stripSlash(raw);
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
  if (process.env.NEXT_PUBLIC_SERVER_URL && !isLocalhost(process.env.NEXT_PUBLIC_SERVER_URL)) {
    origins.add(stripSlash(process.env.NEXT_PUBLIC_SERVER_URL));
  }
  if (process.env.NEXT_PUBLIC_SITE_URL && !isLocalhost(process.env.NEXT_PUBLIC_SITE_URL)) {
    origins.add(stripSlash(process.env.NEXT_PUBLIC_SITE_URL));
  }
  return [...origins].filter(Boolean);
}
