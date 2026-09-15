import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, toSitePath } from "@/lib/constants";
import { socialMetadata } from "@/lib/seo";

const TITLE = "Page Not Found | Elevate Wellness Chiropractic";
const DESCRIPTION =
  "The page you requested is not available. Return to Elevate Wellness Chiropractic for chiropractic care in Bountiful and Clinton, UT.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...socialMetadata({
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/404`,
    index: false,
  }),
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900">
        Page not found
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-700">
        That URL is not available. Visit our homepage for chiropractic care in Bountiful and Clinton, Utah.
      </p>
      <Link
        href={toSitePath("/")}
        className="mt-8 inline-flex w-fit rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white"
      >
        Back to homepage
      </Link>
    </main>
  );
}
