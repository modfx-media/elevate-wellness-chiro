import navStructure from "@/seo-audit/nav-structure.json";
import { toSiteUrl } from "@/lib/constants";

export interface NavItem {
  label: string;
  href: string;
  note?: string;
  doNotChange?: boolean;
  children?: NavItem[];
}

export const headerMenu = navStructure.header.menu as NavItem[];

/** Normalizes site links to https://www.elevatewellnesschiro.com; leaves external/anchor hrefs untouched. */
export function toHref(href: string): string {
  return toSiteUrl(href);
}

function findChild(items: NavItem[], label: string): NavItem | undefined {
  for (const item of items) {
    if (item.label === label) return item;
    if (item.children) {
      const found = findChild(item.children, label);
      if (found) return found;
    }
  }
  return undefined;
}

/** The site-wide booking destination — sourced from nav-structure.json, never hardcoded. */
export const BOOKING_URL =
  findChild(headerMenu, "Schedule Online Appointments")?.href ?? "#";

export const BOUNTIFUL_LOCATION_HREF = toHref(
  findChild(headerMenu, "Bountiful Location")?.href ?? "#",
);
export const CLINTON_LOCATION_HREF = toHref(
  findChild(headerMenu, "Clinton Location")?.href ?? "#",
);
