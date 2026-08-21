import type { SiteInventoryPage } from "@/lib/site-content";
import { PagePlaceholder } from "./PagePlaceholder";

export function AuthorArchiveTemplate({ page }: { page: SiteInventoryPage }) {
  return <PagePlaceholder page={page} typeLabel="Author Archive" />;
}
