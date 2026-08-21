import type { SiteInventoryPage } from "@/lib/site-content";
import { PagePlaceholder } from "./PagePlaceholder";

export function ConditionTemplate({ page }: { page: SiteInventoryPage }) {
  return <PagePlaceholder page={page} typeLabel="Injury / Condition" />;
}
