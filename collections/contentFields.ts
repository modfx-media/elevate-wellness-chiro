import type { CollectionConfig, Field } from "payload";
import { uniqueNullableText } from "./fields/uniqueNullable";
import { previewFromPath } from "../lib/cms/preview";

export const PAGE_TYPE_OPTIONS = [
  { label: "Homepage", value: "homepage" },
  { label: "Service", value: "service" },
  { label: "Injury / condition", value: "injury-condition" },
  { label: "Service location / geo", value: "service-location/geo page" },
  { label: "Category archive", value: "category archive" },
  { label: "Blog post", value: "blog post" },
  { label: "Utility", value: "utility page" },
  { label: "Legal", value: "legal page" },
  { label: "Provider bio", value: "provider bio" },
] as const;

export const routingFields: Field[] = [
  uniqueNullableText("slug", {
    admin: { position: "sidebar" },
  }),
  uniqueNullableText("path", {
    admin: {
      position: "sidebar",
      description: "Public path starting with /, no trailing slash. Homepage is /.",
    },
  }),
  uniqueNullableText("legacyId", {
    admin: { position: "sidebar", readOnly: true },
  }),
  {
    name: "sourceUrl",
    type: "text",
    admin: { position: "sidebar", readOnly: true },
  },
  {
    name: "sourceKind",
    type: "select",
    options: [
      { label: "Inventory", value: "inventory" },
      { label: "pSEO", value: "pseo" },
      { label: "Extra", value: "extra" },
    ],
    admin: { position: "sidebar" },
  },
];

export const seoExtraFields: Field[] = [
  {
    name: "canonicalUrl",
    type: "text",
  },
  {
    name: "noIndex",
    type: "checkbox",
    defaultValue: false,
  },
  {
    name: "noFollow",
    type: "checkbox",
    defaultValue: false,
  },
  {
    name: "excludeFromSitemap",
    type: "checkbox",
    defaultValue: false,
  },
];

export const migratedContentFields: Field[] = [
  {
    name: "pageType",
    type: "select",
    options: [...PAGE_TYPE_OPTIONS],
  },
  {
    name: "title",
    type: "text",
    required: true,
  },
  {
    name: "bodyCopy",
    type: "textarea",
  },
  {
    name: "headings",
    type: "array",
    fields: [
      {
        name: "level",
        type: "select",
        options: ["h1", "h2", "h3", "h4", "h5", "h6"],
      },
      { name: "text", type: "text" },
    ],
  },
  {
    name: "images",
    type: "array",
    fields: [
      { name: "src", type: "text" },
      { name: "alt", type: "text" },
      { name: "placement", type: "text" },
    ],
  },
  {
    name: "videos",
    type: "array",
    fields: [
      { name: "type", type: "text" },
      { name: "id", type: "text" },
      { name: "src", type: "text" },
      { name: "placement", type: "text" },
    ],
  },
  {
    name: "internalLinks",
    type: "json",
  },
  {
    name: "externalLinks",
    type: "json",
  },
  {
    name: "structuredData",
    type: "json",
  },
  {
    name: "openGraph",
    type: "json",
  },
  {
    name: "sourceUpdatedAt",
    type: "date",
    admin: { date: { pickerAppearance: "dayAndTime" } },
  },
  {
    name: "publishedAt",
    type: "date",
    admin: { date: { pickerAppearance: "dayAndTime" }, position: "sidebar" },
  },
  {
    name: "topicSlug",
    type: "text",
    admin: { description: "pSEO topic slug" },
  },
  {
    name: "citySlug",
    type: "text",
    admin: { description: "pSEO city slug" },
  },
  {
    name: "locationKey",
    type: "select",
    options: [
      { label: "Bountiful", value: "bountiful" },
      { label: "Clinton", value: "clinton" },
    ],
  },
  ...seoExtraFields,
];

export const draftVersions = {
  drafts: {
    schedulePublish: true,
  },
  maxPerDoc: 50,
} satisfies CollectionConfig["versions"];

export const previewAdmin = {
  useAsTitle: "title",
  defaultColumns: ["title", "path", "updatedAt"],
  livePreview: {
    url: ({ data }: { data: Record<string, unknown> }) => previewFromPath(data?.path),
  },
  preview: (data: Record<string, unknown>) => previewFromPath(data?.path),
};
