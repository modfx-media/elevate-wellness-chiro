import type { ReactElement } from "react";
import type { SiteInventoryPage } from "@/lib/site-content";
import { ServiceTemplate } from "./ServiceTemplate";
import { ConditionTemplate } from "./ConditionTemplate";
import { LocationTemplate } from "./LocationTemplate";
import { ProviderBioTemplate } from "./ProviderBioTemplate";
import { BlogPostTemplate } from "./BlogPostTemplate";
import { CategoryArchiveTemplate } from "./CategoryArchiveTemplate";
import { LegalTemplate } from "./LegalTemplate";
import { UtilityTemplate } from "./UtilityTemplate";

const TEMPLATES_BY_PAGE_TYPE: Record<
  Exclude<SiteInventoryPage["pageType"], "homepage">,
  (props: { page: SiteInventoryPage }) => ReactElement
> = {
  service: ServiceTemplate,
  "injury-condition": ConditionTemplate,
  "service-location/geo page": LocationTemplate,
  "provider bio": ProviderBioTemplate,
  "blog post": BlogPostTemplate,
  "category archive": CategoryArchiveTemplate,
  "legal page": LegalTemplate,
  "utility page": UtilityTemplate,
};

/** Renders the correct placeholder template for a flat (non-homepage, non-author) route. */
export function renderFlatPageTemplate(page: SiteInventoryPage): ReactElement {
  const Template = TEMPLATES_BY_PAGE_TYPE[page.pageType as Exclude<SiteInventoryPage["pageType"], "homepage">];
  return <Template page={page} />;
}
