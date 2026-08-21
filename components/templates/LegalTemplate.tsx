import type { SiteInventoryPage } from "@/lib/site-content";
import { PagePlaceholder } from "./PagePlaceholder";

export function LegalTemplate({ page }: { page: SiteInventoryPage }) {
  return <PagePlaceholder page={page} typeLabel="Legal" />;
}
