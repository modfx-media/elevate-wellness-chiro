import assert from "node:assert/strict";
import { getBlogPostsSortedByDate } from "../lib/site-content";
import { mergePublishedBlogPosts } from "../lib/cms/blog-posts";
import { cmsDocToInventoryPage } from "../lib/cms/to-inventory";
import { uploadPublicUrl } from "../lib/cms/media-url";
import {
  formatPublishDate,
  isScheduledInFuture,
  publishCalendarDay,
} from "../lib/cms/publish-date";
import type { CmsDoc } from "../lib/cms/types";

const NOW = Date.parse("2026-10-10T12:00:00.000Z");

assert.equal(publishCalendarDay("2026-09-28T00:00:00+00:00"), "2026-09-28");
assert.equal(publishCalendarDay("2026-10-05T00:00:00.000Z"), "2026-10-05");
assert.equal(publishCalendarDay("2026-10-04T16:00:00.000Z"), "2026-10-05");
assert.equal(publishCalendarDay("2026-09-27T16:00:00.000Z"), "2026-09-28");
assert.equal(formatPublishDate("2026-09-28T00:00:00+00:00", "short"), "Sep 28, 2026");
assert.equal(formatPublishDate("2026-10-04T16:00:00.000Z", "long"), "October 5, 2026");
assert.equal(formatPublishDate("2026-09-27T16:00:00.000Z", "long"), "September 28, 2026");
assert.equal(isScheduledInFuture("2026-10-04T16:00:00.000Z", NOW), false);
assert.equal(isScheduledInFuture("2026-10-19T16:00:00.000Z", NOW), true);
assert.equal(isScheduledInFuture("2026-10-11T00:00:00.000Z", NOW), true);
assert.equal(isScheduledInFuture(null, NOW), false);

assert.equal(uploadPublicUrl({ url: "/media/photo.jpg", alt: "A" }), null);
assert.equal(uploadPublicUrl({ url: "/api/media/file/photo.jpg" }), null);
assert.deepEqual(uploadPublicUrl({ url: "/images/inventory/photo.jpg", alt: "Hip" }), {
  url: "/images/inventory/photo.jpg",
  alt: "Hip",
});
assert.deepEqual(
  uploadPublicUrl("https://www.elevatewellnesschiro.com/images/inventory/photo.jpg"),
  { url: "/images/inventory/photo.jpg", alt: "" },
);
const blob = "https://abc123.public.blob.vercel-storage.com/photo.jpg";
assert.equal(uploadPublicUrl({ url: "/media/local.jpg", sizes: { og: { url: blob } }, alt: "Scan" })?.url, blob);

const inventory = getBlogPostsSortedByDate();
const pregnancy = inventory.find((post) => post.slug === "pregnancy-pelvic-girdle-pain-triggers-home-relief-and-when-to-call-ob");
assert.ok(pregnancy);

const duplicate: CmsDoc = {
  id: 2,
  title: "Pregnancy Pelvic Girdle Pain (PGP) in Bountiful: Triggers, Relief, Red Flags",
  slug: "pregnancy-pelvic-girdle-pain-bountiful",
  path: "/pregnancy-pelvic-girdle-pain-bountiful",
  pageType: "blog post",
  publishedAt: "2026-09-27T16:00:00.000Z",
  updatedAt: "2026-10-08T17:20:24.862Z",
  meta: {
    title: "Pregnancy PGP Triggers, Home Relief, and When to Call OB",
    description: pregnancy.metaDescription,
    image: null,
  },
  images: [],
};

const mapped = cmsDocToInventoryPage(duplicate, { collection: "posts" });
assert.equal(mapped.canonicalUrl, pregnancy.canonicalUrl);
assert.equal(publishCalendarDay(mapped.publishDate), "2026-09-28");
assert.equal(mapped.openGraph?.image, pregnancy.openGraph?.image);
assert.ok(mapped.images.some((image) => image.src === pregnancy.openGraph?.image));
assert.notEqual(mapped.lastModified.slice(0, 10), "2026-10-08");

const pediatric: CmsDoc = {
  id: 1,
  title: "Pediatric Chiropractic in Clinton, Utah: What to Expect and When to See",
  slug: "pediatric-chiropractic-in-clinton-utah",
  path: "/pediatric-chiropractic-in-clinton-utah",
  pageType: "blog post",
  publishedAt: "2026-10-04T16:00:00.000Z",
  sourceUpdatedAt: "2026-10-04T16:00:00.000Z",
  updatedAt: "2026-10-08T17:14:49.125Z",
  meta: { title: "Pediatric Chiropractic Visits in Clinton Utah Guide", image: null },
  images: [{ src: null, alt: null, placement: null }],
};

const future: CmsDoc = {
  id: 3,
  title: "A post that is not public yet",
  slug: "future-wellness-note",
  path: "/future-wellness-note",
  pageType: "blog post",
  publishedAt: "2026-10-19T16:00:00.000Z",
  meta: { image: { url: blob, alt: "Future" } },
};

const merged = mergePublishedBlogPosts(inventory, [duplicate, pediatric, future]);
const slugs = merged.map((post) => post.slug);
assert.equal(slugs.filter((slug) => slug === pregnancy.slug).length, 1);
assert.equal(slugs.includes(duplicate.slug!), false);
assert.equal(slugs.includes(future.slug!), false);
assert.equal(slugs[0], pediatric.slug);
assert.equal(merged[0].publishDate, "2026-10-05");
assert.equal(merged.find((post) => post.slug === pregnancy.slug)?.publishDate, pregnancy.publishDate);
assert.ok(inventory.every((post) => slugs.includes(post.slug)));

const withImage: CmsDoc = {
  ...pediatric,
  meta: { image: { url: blob, alt: "Clinton visit" } },
};
const imaged = cmsDocToInventoryPage(withImage, { collection: "posts" });
assert.equal(imaged.openGraph?.image, blob);
assert.equal(imaged.images[0]?.src, blob);

console.log("blog display checks passed");
