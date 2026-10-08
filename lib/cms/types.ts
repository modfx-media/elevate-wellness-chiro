export type CmsHeading = {
  level?: string | null;
  text?: string | null;
  id?: string | null;
};

export type CmsImage = {
  src?: string | null;
  alt?: string | null;
  placement?: string | null;
  id?: string | null;
};

export type CmsVideo = {
  type?: string | null;
  id?: string | null;
  src?: string | null;
  placement?: string | null;
};

export type CmsUploadDoc = {
  url?: string | null;
  alt?: string | null;
  filename?: string | null;
  mimeType?: string | null;
};

export type CmsDoc = {
  id: string | number;
  title?: string | null;
  slug?: string | null;
  path?: string | null;
  pageType?: string | null;
  bodyCopy?: string | null;
  headings?: CmsHeading[] | null;
  images?: CmsImage[] | null;
  videos?: CmsVideo[] | null;
  internalLinks?: unknown;
  externalLinks?: unknown;
  structuredData?: unknown;
  openGraph?: { title?: string; description?: string; image?: string } | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
  excludeFromSitemap?: boolean | null;
  sourceUpdatedAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  topicSlug?: string | null;
  citySlug?: string | null;
  locationKey?: string | null;
  sourceKind?: string | null;
  sourceUrl?: string | null;
  /** Lexical article body. Inline images are upload nodes populated with media.url. */
  content?: unknown;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: number | CmsUploadDoc | null;
  } | null;
};

export type RoutedContent = {
  collection: "pages" | "posts";
  doc: CmsDoc;
};
