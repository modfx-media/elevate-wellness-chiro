import Image from "next/image";
import Link from "next/link";
import { disclaimerText, legalLinks, locations, socialLinks } from "./footer-data";
import { BOOKING_URL } from "./nav-data";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-navy-900 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 h-[400px] w-[600px] rounded-full bg-primary-500/10 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-navy-700/30 blur-[140px]"
      />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.9fr] lg:gap-8">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/">
              <Image
                src="/brand/elevate-wellness-logo-white.png"
                alt="Elevate Wellness Chiropractic"
                width={272}
                height={272}
                className="h-16 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-xs font-display text-lg font-semibold leading-snug text-white/90">
              Elevate Your Wellness, Align Your Life.
            </p>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex w-fit rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
            >
              Schedule Appointment
            </a>

            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-white/60 transition-all duration-200 hover:border-primary-500/60 hover:bg-primary-500/10 hover:text-white"
                >
                  <span aria-hidden>{social.glyph}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Locations */}
          {locations.map((location) => (
            <div key={location.name}>
              <h4 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
                <span aria-hidden className="h-px w-4 bg-primary-500/60" />
                {location.name.replace("Elevate Wellness Chiropractic - ", "")}
              </h4>
              <address className="flex flex-col gap-3 text-sm not-italic text-white/60">
                <span>{location.address}</span>
                <a href={location.telHref} className="w-fit font-semibold text-white/85 transition-colors hover:text-primary-300">
                  {location.phone}
                </a>
                <ul className="mt-1 flex flex-col gap-1 text-xs text-white/45">
                  {location.hours.map((row) => (
                    <li key={row.label} className="flex justify-between gap-3">
                      <span className="font-semibold text-white/60">{row.label}</span>
                      <span className="text-right">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </address>
            </div>
          ))}

          {/* Legal */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
              <span aria-hidden className="h-px w-4 bg-primary-500/60" />
              Legal
            </h4>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] font-medium text-white/55 transition-colors duration-200 hover:text-primary-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/areas-we-serve/"
                  className="text-[13.5px] font-medium text-white/55 transition-colors duration-200 hover:text-primary-300"
                >
                  Areas We Serve
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap/"
                  className="text-[13.5px] font-medium text-white/55 transition-colors duration-200 hover:text-primary-300"
                >
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-[11px] leading-relaxed text-white/35">{disclaimerText}</p>
          <div className="flex shrink-0 flex-col items-start gap-1 md:items-end">
            <p className="text-[12.5px] font-medium text-white/45">
              &copy; {year} Elevate Wellness Chiropractic. All Rights Reserved.
            </p>
            <p className="text-[11.5px] text-white/35">
              Powered by{" "}
              <a
                href="https://modfxmedia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/60 transition-colors duration-200 hover:text-primary-300"
              >
                MODFXMEDIA
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
