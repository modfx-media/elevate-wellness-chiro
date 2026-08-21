import type { SiteInventoryPage } from "@/lib/site-content";

/**
 * Shared placeholder shell for every route template. Phase 2 scaffolding only —
 * real page design/content is built in a later phase.
 */
export function PagePlaceholder({
  page,
  typeLabel,
}: {
  page: SiteInventoryPage;
  typeLabel: string;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-24">
      <span className="w-fit rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-900">
        {typeLabel}
      </span>
      <h1 className="text-3xl font-bold text-ink-900">{page.title}</h1>
      <p className="font-mono text-sm text-ink-700">
        slug: {page.slug || "(home)"} · path: {page.path}
      </p>
      <p className="text-ink-500">TODO: content</p>
    </main>
  );
}
