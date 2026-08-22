import Image from "next/image";
import type { SiteInventoryPage } from "@/lib/site-content";
import { HomepageSchema } from "@/components/home/HomepageSchema";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { HeroEntrance } from "@/components/home/HeroEntrance";
import { MotionLink } from "@/components/home/MotionLink";
import { MotionButton } from "@/components/home/MotionButton";
import { HeroVideoBackground } from "@/components/home/HeroVideoBackground";
import { HeroDiptych } from "@/components/home/HeroDiptych";
import { HeroStat } from "@/components/home/HeroStat";
import { HeroTrustChip } from "@/components/home/HeroTrustChip";
import { ReviewsBand } from "@/components/home/ReviewsBand";
import { ReviewCarousel } from "@/components/home/ReviewCarousel";
import { LocationsMap } from "@/components/home/LocationsMap";
import { ProvidersSection } from "@/components/home/ProvidersSection";
import type { CSSProperties } from "react";
import {
  hero,
  trustBadges,
  services,
  servicesHeading,
  ctaBanner,
  faqItems,
  faqHeading,
  faqCategoryLabel,
  blogHeading,
  blogFallbackImages,
  getRecentBlogPosts,
  reviews,
  testimonials,
  locations,
  locationsHeading,
  getLocationContent,
  type LocationKey,
} from "@/components/home/homepage-data";

function SectionEyebrow({ label }: { label: string }) {
  return (
    <div className="reveal flex items-center justify-center gap-3">
      <span aria-hidden className="h-px w-10 bg-primary-500/60" />
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
        {label}
      </span>
      <span aria-hidden className="h-px w-10 bg-primary-500/60" />
    </div>
  );
}

function formatBlogDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function HomepageTemplate({
  page,
  location = "bountiful",
}: {
  page: SiteInventoryPage;
  location?: LocationKey;
}) {
  void page; // metadata is already built from this record in the route
  const recentPosts = getRecentBlogPosts(4);
  const content = getLocationContent(location);
  const philosophy = content.philosophy;

  return (
    <main className="flex flex-1 flex-col">
      <HomepageSchema />

      {/* Hero — side-by-side over a muted chiropractic video background */}
      <section className="relative overflow-hidden bg-navy-900 px-6 pb-14 pt-16 lg:px-8 lg:pb-16 lg:pt-20">
        <HeroVideoBackground />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <HeroEntrance
              eyebrow={content.heroEyebrow}
              headline={hero.headline}
              subheadline={hero.subheadline}
              topSlot={<HeroTrustChip rating={reviews.ratingValue} reviewCount={reviews.reviewCount} />}
            />

            <HeroDiptych
              topSrc={hero.actionShots[0]}
              bottomSrc={hero.actionShots[1]}
              topAlt="Chiropractic adjustment at Elevate Wellness Chiropractic"
              bottomAlt="Spinal decompression treatment at Elevate Wellness Chiropractic"
              ratingValue={trustBadges[0].value}
              ratingLabel={trustBadges[0].label}
            />
          </div>

          {/* Trust stats — one connected glass strip with dividers (desktop only; hero is compact on mobile) */}
          <div className="mt-10 hidden flex-wrap items-stretch overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md lg:inline-flex">
            {trustBadges.map((badge, i) => (
              <div
                key={badge.label}
                className={`px-6 py-4 ${i > 0 ? "border-l border-white/10" : ""}`}
              >
                <HeroStat value={badge.value} label={badge.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid — compact tile grid, body copy reveals on hover to keep the section short */}
      <section id="services" className="mx-auto w-full max-w-[1280px] px-6 py-14 lg:px-8 lg:py-24">
        <SectionEyebrow label="What We Do" />
        <h2 className="reveal mt-4 text-center font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          {servicesHeading}
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {services.map((service, i) => (
            <MotionLink
              key={service.title}
              href={service.href}
              className="group reveal flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl"
              style={{ "--reveal-delay": `${(i % 4) * 80}ms` } as CSSProperties}
            >
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(min-width: 1024px) 23vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-navy-900/95 via-navy-900/25 to-transparent"
                />
                <span className="absolute left-3 top-3 font-display text-xl font-bold text-white/50 sm:text-2xl">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Below lg: title only over the image, description sits in its own panel underneath (see below) */}
                <div className="absolute inset-x-3 bottom-3">
                  <h3 className="font-display text-sm font-semibold leading-tight text-white sm:text-base">
                    {service.title}
                  </h3>
                  {/* Desktop only — body copy reveals on hover/focus inside the image, tile stays compact by default */}
                  <div className="hidden lg:grid lg:grid-rows-[0fr] lg:transition-[grid-template-rows] lg:duration-300 lg:ease-out lg:group-hover:grid-rows-[1fr] lg:group-focus-visible:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-white/80">
                        {service.body}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-300">
                        Learn more &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Below lg only — description + link as a normal-flow panel, never overlapping the image */}
              <div className="flex flex-1 flex-col gap-2 p-4 lg:hidden">
                <p className="line-clamp-3 text-sm leading-relaxed text-ink-700">
                  {service.body}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
                  Learn more &rarr;
                </span>
              </div>
            </MotionLink>
          ))}
        </div>
      </section>

      {/* Bountiful / practice philosophy */}
      <section className="relative overflow-hidden bg-gray-50 px-6 py-16 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -left-4 -top-4 hidden h-full w-full rounded-3xl border border-primary-300/70 lg:block"
            />
            <div className="reveal relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-xl">
              <Image
                src={philosophy.image}
                alt="Elevate Wellness Chiropractic in Bountiful, Utah"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div
              className="reveal absolute -bottom-6 -right-4 max-w-[13rem] rounded-2xl bg-navy-900 p-5 shadow-2xl sm:-right-6"
              style={{ "--reveal-delay": "220ms" } as CSSProperties}
            >
              <p className="font-display text-3xl font-bold text-primary-300">{trustBadges[2].value}</p>
              <p className="mt-1 text-[0.7rem] font-semibold uppercase leading-tight tracking-wide text-white/60">
                {trustBadges[2].label} across Davis County
              </p>
            </div>
          </div>

          <div className="reveal" style={{ "--reveal-delay": "120ms" } as CSSProperties}>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-primary-500/60" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                {philosophy.eyebrow}
              </span>
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              {philosophy.heading}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-700">{philosophy.body}</p>
            <MotionLink
              href={hero.ctaHref}
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-navy-900 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-900/90"
            >
              {hero.ctaLabel} &rarr;
            </MotionLink>
          </div>
        </div>
      </section>

      {/* Meet Your Chiropractors — location-aware providers */}
      <ProvidersSection heading={content.providersHeading} providers={content.providers} />

      {/* CTA banner — two-column card, real chiropractic photo + copy */}
      <section className="px-6 py-14 lg:px-8 lg:py-24">
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-navy-900 shadow-2xl">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
            {/* Left column — photo */}
            <div className="relative min-h-[360px] lg:min-h-[520px]">
              <Image
                src="/images/homepage/schedule-today-v2.png"
                alt="Chiropractor evaluating a patient's spine at Elevate Wellness Chiropractic"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy-900/60 via-transparent to-navy-900/95 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-navy-900/40" />
            </div>

            {/* Right column — copy + CTAs */}
            <div className="relative flex flex-col justify-center px-8 py-16 sm:px-12 lg:py-20 lg:pr-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full border border-white/10"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-28 right-1/3 h-80 w-80 rounded-full bg-primary-500/10 blur-[130px]"
              />
              <div className="reveal relative">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
                  <span aria-hidden className="h-px w-8 bg-primary-500/60" />
                  {ctaBanner.eyebrow}
                </p>
                <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  {ctaBanner.heading}
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">{content.ctaBody}</p>

                <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <MotionButton
                    href={ctaBanner.onlineHref}
                    external
                    className="rounded-full bg-primary-500 px-8 py-4 text-base font-semibold text-ink-900 transition-colors hover:bg-primary-600"
                  >
                    {ctaBanner.onlineLabel}
                  </MotionButton>
                  <MotionButton
                    href={content.telHref}
                    className="rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    {ctaBanner.callLabel}: {content.phone}
                  </MotionButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — sticky label column + accordion, like a modern SaaS FAQ layout */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:px-8 lg:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="reveal lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center gap-3 lg:justify-start">
              <span aria-hidden className="h-px w-10 bg-primary-500/60" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
                {faqCategoryLabel}
              </span>
            </div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              {faqHeading}
            </h2>
          </div>
          <div className="reveal">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* Reviews / testimonials — rating band + real review carousel merged into one dark section */}
      <section className="relative overflow-hidden bg-navy-900 px-6 py-16 lg:px-8 lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[640px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[150px]"
        />
        <div className="relative">
          <ReviewsBand
            eyebrow={reviews.eyebrow}
            heading={reviews.heading}
            ratingValue={reviews.ratingValue}
            starCount={reviews.starCount}
            reviewCount={reviews.reviewCount}
            reviewCountLabel={reviews.reviewCountLabel}
            body={reviews.body}
            googleLabel={reviews.googleLabel}
            googleHref={reviews.googleHref}
            bookLabel={reviews.bookLabel}
            bookHref={reviews.bookHref}
          />

          <div
            className="reveal mx-auto mt-16 w-full max-w-[1280px]"
            style={{ "--reveal-delay": "160ms" } as CSSProperties}
          >
            <ReviewCarousel reviews={testimonials} />
          </div>
        </div>
      </section>

      {/* Blog preview */}
      <section className="bg-gray-50 px-6 py-16 lg:px-8 lg:py-28">
        <div className="mx-auto w-full max-w-[1280px]">
          <SectionEyebrow label="From the Blog" />
          <h2 className="reveal mt-4 text-center font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            {blogHeading}
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {recentPosts.map((post, i) => (
              <MotionLink
                key={post.slug}
                href={post.href}
                className="group reveal flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-2xl"
              >
                <div
                  className="relative aspect-video w-full overflow-hidden"
                  style={{ "--reveal-delay": `${(i % 4) * 90}ms` } as CSSProperties}
                >
                  <Image
                    src={blogFallbackImages[i % blogFallbackImages.length]}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 25vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {post.publishDate ? (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-navy-900 backdrop-blur-sm">
                      {formatBlogDate(post.publishDate)}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-base font-semibold leading-snug text-ink-900 transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-700">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    Read article
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </span>
                </div>
              </MotionLink>
            ))}
          </div>
        </div>
      </section>

      {/* Locations + map — both real Utah offices with hours & directions */}
      <section className="mx-auto w-full max-w-[1280px] px-6 py-16 lg:px-8 lg:py-28">
        <SectionEyebrow label={locationsHeading.eyebrow} />
        <h2 className="reveal mt-4 text-center font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
          {locationsHeading.heading}
        </h2>
        <p className="reveal mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-ink-700">
          {locationsHeading.body}
        </p>
        <LocationsMap locations={locations} />
      </section>
    </main>
  );
}
