"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  headerMenu,
  toHref,
  BOOKING_URL,
  type NavItem,
} from "./nav-data";
import { locations, socialLinks } from "./footer-data";
import { MobileMenu } from "./MobileMenu";

const LOCATION_TABS = [
  { label: "Bountiful", href: "/" },
  { label: "Clinton", href: "/clinton" },
] as const;

function shortLocationName(name: string): string {
  if (name.includes("Bountiful")) return "Bountiful";
  if (name.includes("Clinton")) return "Clinton";
  return name;
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  // Reproduces the reference site's compact-on-scroll sticky nav interaction
  // (shorter, shadowed, opaque) using Elevate Wellness's own light color scheme.
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top utility bar — collapses on scroll */}
      <div
        className={`overflow-hidden border-b border-white/10 bg-[#0c2c3b] text-white transition-all duration-300 ${
          isScrolled ? "max-h-0 opacity-0" : "max-h-16 opacity-100"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-6 py-2 lg:px-8">
          {/* Location tabs — switch between the two location homepages */}
          <div className="flex items-center gap-1 text-xs font-semibold">
            {LOCATION_TABS.map((tab) => {
              const active =
                tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`rounded-full px-3 py-1 uppercase tracking-wide transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 sm:flex">
              {locations.map((location) => (
                <a
                  key={location.name}
                  href={location.telHref}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/80 transition-colors hover:text-white"
                >
                  <PhoneGlyph />
                  <span className="hidden md:inline">{shortLocationName(location.name)}:</span>
                  <span>{location.phone}</span>
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-1 sm:flex">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <span aria-hidden>{social.glyph}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      {/* Main nav bar */}
      <div
        className={`w-full border-b border-white/10 bg-navy-900 transition-all duration-300 ${
          isScrolled ? "py-2 shadow-lg" : "py-3"
        }`}
      >
        <nav
          ref={navRef}
          aria-label="Primary"
          className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-6 lg:px-8"
        >
          <Link href="/" className="shrink-0" onClick={() => setOpenMenu(null)}>
            <Image
              src="/brand/elevate-wellness-logo-white.png"
              alt="Elevate Wellness Chiropractic"
              width={272}
              height={272}
              priority
              className={`w-auto transition-all duration-300 ${isScrolled ? "h-14" : "h-20"}`}
            />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {headerMenu.map((item) => (
              <DesktopNavItem
                key={item.label}
                item={item}
                isOpen={openMenu === item.label}
                onOpen={() => setOpenMenu(item.label)}
                onToggle={() =>
                  setOpenMenu((current) => (current === item.label ? null : item.label))
                }
              />
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600 lg:inline-block"
            >
              Schedule Appointment
            </a>

            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
            >
              <span aria-hidden>{mobileOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </nav>
      </div>

      <div id="mobile-menu">
        <MobileMenu items={headerMenu} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      </div>
    </header>
  );
}

function PhoneGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5 text-primary-300">
      <path
        d="M6.5 3.5 9 4l1 3.5-1.8 1.4a12 12 0 0 0 5.4 5.4L15 16.5 18.5 15l.5 2.5a2 2 0 0 1-2 2.4A14 14 0 0 1 3.6 6a2 2 0 0 1 2.4-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DesktopNavItem({
  item,
  isOpen,
  onOpen,
  onToggle,
}: {
  item: NavItem;
  isOpen: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const hasChildren = !!item.children?.length;

  return (
    <li
      className="relative"
      onMouseEnter={hasChildren ? onOpen : undefined}
      onFocus={hasChildren ? onOpen : undefined}
    >
      <div className="flex items-center">
        <Link
          href={toHref(item.href)}
          className="rounded-md px-3 py-2 text-sm font-semibold text-white transition-colors hover:text-primary-300"
        >
          {item.label}
        </Link>
        {hasChildren && (
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={`Toggle ${item.label} submenu`}
            onClick={onToggle}
            className="rounded-md p-1 text-white/60 transition-colors hover:text-primary-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <DesktopDropdown items={item.children!} />
      )}
    </li>
  );
}

function DesktopDropdown({ items }: { items: NavItem[] }) {
  const groups = items.filter((c) => c.children?.length);
  const flat = items.filter((c) => !c.children?.length);
  const twoCol = flat.length > 6;

  return (
    <div
      className={`dropdown-in absolute left-0 top-full z-50 mt-3 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl ring-1 ring-black/5 ${
        twoCol ? "min-w-[26rem]" : "min-w-[19rem]"
      }`}
    >
      {/* Grouped subcategories — inside a tinted card with an accent bar */}
      {groups.map((group) => (
        <div
          key={group.label}
          className="rounded-xl border border-primary-200/60 bg-primary-100/40 p-3"
        >
          <p className="flex items-center gap-2 px-1 pb-2 text-[0.7rem] font-bold uppercase tracking-wider text-primary-600">
            <span aria-hidden className="h-px w-4 bg-primary-500/70" />
            {group.label}
          </p>
          <div className="flex flex-col">
            {group.children!.map((grandchild) => (
              <Link
                key={grandchild.label}
                href={toHref(grandchild.href)}
                className="rounded-lg px-3 py-1.5 text-[13.5px] font-medium text-ink-700 transition-colors hover:bg-white hover:text-navy-900"
              >
                {grandchild.label}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Flat quick links — separated by a divider; wraps to 2 columns when long */}
      {flat.length > 0 && (
        <div
          className={`${groups.length > 0 ? "border-t border-gray-100 pt-2" : ""} grid ${
            twoCol ? "grid-cols-2 gap-x-2" : "grid-cols-1"
          }`}
        >
          {flat.map((child) => (
            <Link
              key={child.label}
              href={toHref(child.href)}
              target={child.doNotChange ? "_blank" : undefined}
              rel={child.doNotChange ? "noopener noreferrer" : undefined}
              className="group/link flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500 transition-colors group-hover/link:bg-primary-300"
                />
                {child.label}
              </span>
              <span
                aria-hidden
                className="text-primary-500 opacity-0 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:opacity-100 group-hover/link:text-primary-300"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
