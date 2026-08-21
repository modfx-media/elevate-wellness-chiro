import navStructure from "@/seo-audit/nav-structure.json";
import napAndHours from "@/seo-audit/nap-and-hours.json";
import { toHref } from "./nav-data";

const LEGAL_LABELS = [
  "Privacy Policy",
  "Terms",
  "Accessibility Statement",
  "Anti-Discrimination Disclaimer",
  "Healthcare Disclaimer",
  "HIPAA Notice of Privacy Practices",
] as const;

export const disclaimerText = navStructure.footer.disclaimerText;

export const legalLinks = LEGAL_LABELS.map((label) => {
  const match = navStructure.footer.links.find((link) => link.label === label);
  if (!match) throw new Error(`Missing required footer link in nav-structure.json: ${label}`);
  return { label, href: toHref(match.href) };
});

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const DAY_ABBR: Record<(typeof DAY_ORDER)[number], string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

/** Collapses consecutive days sharing identical hours (e.g. Mon-Fri) into one row. */
function groupHours(hours: Record<string, string>) {
  const groups: { label: string; value: string }[] = [];
  let i = 0;
  while (i < DAY_ORDER.length) {
    const day = DAY_ORDER[i];
    const value = hours[day];
    let j = i;
    while (j + 1 < DAY_ORDER.length && hours[DAY_ORDER[j + 1]] === value) j++;
    const label = i === j ? DAY_ABBR[day] : `${DAY_ABBR[day]}\u2013${DAY_ABBR[DAY_ORDER[j]]}`;
    groups.push({ label, value });
    i = j + 1;
  }
  return groups;
}

/** Formats a US phone string like "(801) 214-0454" as a tel: href. */
function toTelHref(phone: string) {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}

export const locations = napAndHours.locations.map((location) => ({
  name: location.name,
  address: location.address.asPublishedOnContactPage,
  phone: location.phone,
  telHref: toTelHref(location.phone),
  hours: groupHours(location.hours),
}));

export const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/simmondschiropracticandwellness/", glyph: "f" },
  { label: "YouTube", href: "https://www.youtube.com/channel/UCes_qtGCiHtZc5N9_wHyZFw", glyph: "\u25b6" },
  { label: "Pinterest", href: "https://www.pinterest.com/elevatewellnesschiroUT/", glyph: "P" },
  { label: "Google", href: "https://share.google/nyvuVYd0MIa1G7L5o", glyph: "G" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/elevate-wellness-chiroptactic", glyph: "in" },
];
