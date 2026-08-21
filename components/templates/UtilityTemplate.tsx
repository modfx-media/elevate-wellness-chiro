import type { SiteInventoryPage } from "@/lib/site-content";
import { PagePlaceholder } from "./PagePlaceholder";

export function UtilityTemplate({ page }: { page: SiteInventoryPage }) {
  return <PagePlaceholder page={page} typeLabel="Utility" />;
}
