# Elevate Wellness Chiropractic — Design Tokens & System Plan

Phase 2 deliverable. This document defines the visual design system (colors,
type, spacing, component patterns) to be used when building page templates in
a later phase. **No page templates are implemented yet** — this is tokens +
brand assets only.

## 1. Brand assets extracted

Source: live site `https://www.elevatewellnesschiro.com` (WordPress uploads +
header `<img class="custom-logo">` + favicon `<link>` tags in `<head>`).

Saved to `/public/brand/`:

| File | Origin | Size | Notes |
|---|---|---|---|
| `elevate-wellness-logo-color.png` | `wp-content/uploads/2020/09/ELEVATE-WELLNESS-CHIRO-LOGO.png` | 750×750, transparent bg | Full-color original mark. Used for pixel sampling below. |
| `elevate-wellness-logo-white.png` | `wp-content/uploads/2025/03/ELEVATE-WELLNESS-CHIRO-LOGO-WHITE.png` | 272×272, transparent bg | White-recolored variant (for dark/colored header backgrounds). |
| `elevate-wellness-favicon-512.png` | `wp-content/uploads/2020/09/cropped-ELEVATE-WELLNESS-CHIRO-LOGO.png` | 512×512 | Square crop used for site icon/favicon generation. |

## 2. Color tokens — derived from real pixel sampling of the logo

Sampling method: decoded each PNG's raw pixel buffer (via `pngjs`) and built a
frequency histogram of opaque (alpha > threshold) RGB values. The logo is a
flat two-color design (no gradients/anti-aliasing beyond edge blending), so the
histogram resolved to exactly two solid fills:

| Sampled color | Hex | Where in the logo | % of opaque pixels |
|---|---|---|---|
| Sky blue | `#6CCFF6` | The "ELEVATE" wordmark | 12.6% |
| Charcoal | `#4C4D4F` | Mountain range, tree silhouette, "WELLNESS CHIROPRACTIC" wordmark, triangle outline | 87.4% |

Cross-checked against the white logo variant: the charcoal recolors to
`#FFFFFF` on dark surfaces while the sky blue is left untouched — confirming
`#6CCFF6` is the fixed brand accent and `#4C4D4F`/white is the swappable
ink/surface pairing.

From these two sampled colors, a full palette was **mathematically derived**
(HSL lighten/darken and linear RGB mixing toward white — no new hues
introduced, no generic healthcare palette):

### Primary (brand blue — from "ELEVATE")

| Token | Hex | Derivation | Usage |
|---|---|---|---|
| `--color-primary-100` | `#DAF3FD` | mix(primary, white, 75%) | Tinted section/card backgrounds |
| `--color-primary-200` | `#BDE9FB` | mix(primary, white, 55%) | Hover backgrounds, badge fills |
| `--color-primary-300` | `#91DBF8` | mix(primary, white, 25%) | Borders/dividers on light surfaces |
| `--color-primary-500` | `#6CCFF6` | **sampled** | Icons, links on dark surfaces, large headings, illustrative accents |
| `--color-primary-600` | `#32BCF2` | darken(primary, 12% L) | Hover state for primary buttons/links |
| `--color-accent` | `#0DA0DA` | darken(primary, 24% L) | Active/pressed state, focus rings, small high-emphasis accents (icons, underlines) |

⚠️ **Contrast note**: `primary-500` on white is only **1.77:1** — fails WCAG AA
for text. Do not use `primary-500`/`600` as small body text color on a white
background. Safe uses: large display text, icon fill, backgrounds with dark
text on top, or text on dark surfaces (white-on-primary is also 1.77:1, so
pair primary backgrounds with `ink-900` text, not white text, if primary is
used as a solid button fill — see §2.1).

### Secondary / Dark (ink — from mountain + wordmark)

| Token | Hex | Derivation | Usage |
|---|---|---|---|
| `--color-ink-900` | `#4C4D4F` | **sampled** | Body text, headings, primary CTA button fill, header/footer dark surface |
| `--color-ink-700` | `#797A7B` | mix(ink, white, 25%) | Secondary/muted text |
| `--color-ink-500` | `#9D9D9E` | mix(ink, white, 45%) | Placeholder text, disabled state |

`ink-900` on white = **8.46:1** (passes AAA). White on `ink-900` = **8.46:1**
(passes AAA) — this is the safe high-contrast text pairing for dark surfaces
(sticky header once scrolled-to-top/transparent state, footer, dark CTA
banner).

### Neutral / background set (interpolated between sampled charcoal and sampled white)

| Token | Hex | Derivation | Usage |
|---|---|---|---|
| `--color-white` | `#FFFFFF` | sampled (logo/page background) | Page background, card surfaces |
| `--color-gray-50` | `#F9F9F9` | mix(ink, white, 96.5%) | App shell background, alternating section bg |
| `--color-gray-100` | `#EDEDED` | mix(ink, white, 90%) | Card/section surface on white pages |
| `--color-gray-300` | `#CDCDCE` | mix(ink, white, 72%) | Borders, dividers, input outlines |

### 2.1 Usage notes (light/dark)

- **Light surfaces (default page bg = white/gray-50)**: text = `ink-900`;
  muted text = `ink-700`; primary buttons = `ink-900` fill + white text (not
  primary-fill, per the contrast note above) OR `primary-500` fill + `ink-900`
  text for a "brand-colored" secondary button; links/icons = `primary-600`.
- **Dark surfaces (header on hero, footer, CTA banner)**: bg = `ink-900`;
  text = white; the "ELEVATE"-style word/accent = `primary-500`; borders =
  `ink-700`.
- **Accent** (`#0DA0DA`) is reserved for small, high-emphasis interactive
  details: focus outlines, active nav underline, hover state on outlined
  buttons, icon accents in stat rows — not for large fills or body text.

## 3. Typography

Two Google Fonts, self-hosted via `next/font/google` (already the project's
pattern — `app/layout.tsx` currently loads `Geist`/`Geist_Mono` the same way).

- **Display / heading face**: `Poppins` (600/700) — geometric, friendly-bold,
  reads well at large sizes for a wellness/chiropractic hero headline.
- **Body face**: `Inter` (400/500/600) — high legibility for long-form
  service/condition copy carried over from the Phase 1 content inventory.

### Type scale (rem, 16px root)

| Token | Size | Line-height | Weight | Face | Use |
|---|---|---|---|---|---|
| `--text-display` | 3.5rem / 56px (2.5rem mobile) | 1.05 | 700 | Poppins | Hero H1 |
| `--text-h1` | 2.5rem / 40px (2rem mobile) | 1.15 | 700 | Poppins | Page H1 |
| `--text-h2` | 2rem / 32px (1.5rem mobile) | 1.2 | 600 | Poppins | Section headings |
| `--text-h3` | 1.5rem / 24px | 1.3 | 600 | Poppins | Card/subsection headings |
| `--text-h4` | 1.25rem / 20px | 1.4 | 600 | Poppins | Small headings, FAQ question |
| `--text-body-lg` | 1.125rem / 18px | 1.6 | 400 | Inter | Hero subhead, lead paragraphs |
| `--text-body` | 1rem / 16px | 1.6 | 400 | Inter | Default body copy |
| `--text-small` | 0.875rem / 14px | 1.5 | 400 | Inter | Captions, meta, footer links |
| `--text-eyebrow` | 0.75rem / 12px | 1.4 | 600, uppercase, +0.08em tracking | Inter | Section labels (e.g. "OUR SERVICES") |

## 4. Spacing, layout rhythm & breakpoints

8px base unit, Tailwind's default spacing scale is sufficient (`1` = 4px steps
already exist); section rhythm is standardized on top of it:

| Token | Value | Use |
|---|---|---|
| `--space-section-y` | 6rem (96px) desktop / 3.5rem (56px) mobile | Vertical padding between major page sections |
| `--space-block-y` | 2.5rem (40px) | Spacing between a section's heading block and its content |
| `--space-card-gap` | 2rem (32px) | Gutter between cards in a grid (feature cards, blog cards) |
| `--space-card-p` | 1.75rem (28px) | Internal card padding |
| `--radius-card` | 1rem (16px) | Card/panel corner radius |
| `--radius-button` | 9999px (full/pill) | Button corner radius — see §5 |

### Section vertical-padding tiers (implemented convention)

`--space-section-y` above is the general spec; in practice every page
section should use one of these three concrete Tailwind utility pairs so
spacing stays consistent site-wide and never stacks into oversized mobile
whitespace gaps between adjacent sections:

| Tier | Classes | Mobile / Desktop | Use for |
|---|---|---|---|
| **Standard** | `py-14 lg:py-24` | 56px / 96px | Default content sections — service grids, CTA-card wrappers, offices/contact grids, provider bio, FAQ/CTA bands on interior pages |
| **Feature** | `py-16 lg:py-28` | 64px / 112px | Hero-weight or dark/colored bands — philosophy band, homepage FAQ, reviews/testimonials, blog teaser, locations/map, area bands |
| **Compact** | `py-8 lg:py-10` | 32px / 40px | Slim callout/estimate bars |

Horizontal gutter stays `px-6 lg:px-8` (24px/32px) everywhere — already
consistent, no tier needed. Never pair two adjacent sections that both use
the Feature tier's full padding without a strong visual break (image, card,
divider) between them — the combined 128px+ can read as unintentional
whitespace on mobile.

### Breakpoints (Tailwind defaults — no custom breakpoints needed)

`sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px · `2xl` 1536px. Content
max-width container: `1280px` with `1.5rem` (24px) side padding on mobile,
`2rem` (32px) on `lg+`.

## 5. Component patterns (spec only — no template code this phase)

UX/structure reference reviewed: `regenerativerevival.com` (layout/UX only —
**no colors, copy, or imagery reused**; all colors above come from the
Elevate Wellness logo, all copy/imagery from the Phase 1
`seo-audit/site-inventory.json`).

- **Sticky header**: Fixed/sticky top nav. Starts transparent-on-hero (light
  text/logo-white variant) over the hero image; once scrolled past the hero,
  crossfades to a solid `white` background with a subtle bottom shadow and
  swaps to the color logo + `ink-900` nav text. Right side: pill-shaped
  (`radius-button`) primary CTA button + a hamburger icon that opens an
  off-canvas/overlay menu (not a horizontal link list) — keeps the header
  compact even with many nav items (relevant here: 2 locations + many
  service/condition pages from the Phase 1 inventory).
- **Hero**: Full-bleed background image/video, centered content column
  (max-width ~52rem), small uppercase "eyebrow" label flanked by short
  horizontal rules, large display headline, one lead paragraph, one primary
  pill CTA button. A **trust-badge row** sits below the fold copy as a
  horizontal row of small stat/claim pairs (e.g. "X years in practice",
  "X patients treated", "2 Utah locations") separated by thin vertical
  dividers on desktop, wrapping to stacked rows on mobile.
- **3-up feature cards**: Three-column grid (`grid-cols-1 md:grid-cols-3`,
  `space-card-gap` gutter), each card = numbered badge ("01"/"02"/"03") +
  small category label + heading + 2–3 line description + text link. Cards
  are equal height, top-aligned content, generous internal padding
  (`space-card-p`), and a subtle `gray-100` or 1px `gray-300` border rather
  than a heavy shadow.
- **Stat / trust-badge row**: A dark (`ink-900`) full-width band with 3–4
  large numeral+label pairs in a horizontal flex row (stacks on mobile),
  numerals in `text-h1`/Poppins weight, labels in `text-small`/uppercase.
- **CTA banner**: Full-width band (can reuse the dark `ink-900` surface or a
  `primary-100` tint band), centered short heading + one-line supporting copy
  + single pill CTA button — used both mid-page and just above the footer.
- **FAQ accordion**: Single-column list, each item a full-width button row
  (question + trailing chevron icon that rotates on open), `gray-300`
  1px divider between items, answer panel expands with a simple height
  transition, `ink-700` for the answer text.
- **Blog card**: Image top (16:9, `radius-card` on the top corners only),
  small uppercase category/eyebrow label + read-time, `text-h4` title
  (2-line clamp), 1-line excerpt, "Read article →" text link in `accent`
  color. Grid of 3 on desktop, 1 on mobile, same gap as feature cards.
- **Footer**: Dark (`ink-900`) surface, 4-column link grid on desktop
  (`Services` / `About` / `Resources` / `Contact` — mirrors the two-location,
  multi-service structure from `seo-audit/nav-structure.json`), each column
  headed by an uppercase `text-eyebrow`-style label, generous vertical gap
  between links, brand logo (white variant) + one-line tagline in the first
  column, social icons + legal/compliance fine print and copyright line
  along the bottom, separated by a `1px` `ink-700` divider.

## 6. Implementation status

- ✅ Logo assets copied to `/public/brand/`.
- ✅ Color tokens added as CSS custom properties + Tailwind v4 `@theme inline`
  extension in [app/globals.css](../app/globals.css) (this project uses
  Tailwind v4's CSS-first config, confirmed via `package.json`
  `"tailwindcss": "^4"` + the existing `@theme inline` block — no
  `tailwind.config.ts` exists or is needed).
- ⏳ Typography (`Poppins`/`Inter` via `next/font/google`) and the component
  patterns above are documented here as the spec for the next phase; wiring
  them into `app/layout.tsx` and building actual components/page templates is
  intentionally deferred to the next phase per this phase's scope.
