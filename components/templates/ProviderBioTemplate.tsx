import type { SiteInventoryPage } from "@/lib/site-content";
import { PagePlaceholder } from "./PagePlaceholder";

export function ProviderBioTemplate({ page }: { page: SiteInventoryPage }) {
  return <PagePlaceholder page={page} typeLabel="Provider Bio" />;
}
