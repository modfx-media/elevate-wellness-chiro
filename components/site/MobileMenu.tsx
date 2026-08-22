"use client";

import Link from "next/link";
import type { NavItem } from "./nav-data";
import { toHref, BOOKING_URL, BOUNTIFUL_LOCATION_HREF, CLINTON_LOCATION_HREF } from "./nav-data";

export function MobileMenu({
  items,
  open,
  onClose,
  topOffset,
}: {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
  topOffset: number;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-white lg:hidden"
      style={{ top: topOffset }}
    >
      <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 py-6">
        {items.map((item) =>
          item.children ? (
            <details key={item.label} className="border-b border-gray-100 py-1">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between py-3 text-base font-semibold text-ink-900">
                {item.href === "#" ? (
                  <span>{item.label}</span>
                ) : (
                  <Link href={toHref(item.href)} onClick={onClose}>
                    {item.label}
                  </Link>
                )}
                <span aria-hidden className="text-ink-500">▾</span>
              </summary>
              <div className="flex flex-col gap-0.5 py-1 pl-4">
                {item.children.map((child) =>
                  child.children ? (
                    <details key={child.label} className="py-0.5">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center py-3 text-sm font-semibold text-ink-700">
                        {child.label}
                      </summary>
                      <div className="flex flex-col gap-0.5 py-1 pl-4">
                        {child.children.map((grandchild) => (
                          <Link
                            key={grandchild.label}
                            href={toHref(grandchild.href)}
                            onClick={onClose}
                            className="flex min-h-11 items-center py-3 text-sm text-ink-700"
                          >
                            {grandchild.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link
                      key={child.label}
                      href={toHref(child.href)}
                      onClick={onClose}
                      target={child.doNotChange ? "_blank" : undefined}
                      rel={child.doNotChange ? "noopener noreferrer" : undefined}
                      className="flex min-h-11 items-center py-3 text-sm text-ink-700"
                    >
                      {child.label}
                    </Link>
                  ),
                )}
              </div>
            </details>
          ) : (
            <Link
              key={item.label}
              href={toHref(item.href)}
              onClick={onClose}
              className="flex min-h-11 items-center border-b border-gray-100 py-3 text-base font-semibold text-ink-900"
            >
              {item.label}
            </Link>
          ),
        )}

        <div className="mt-4 flex gap-2">
          <Link
            href={BOUNTIFUL_LOCATION_HREF}
            onClick={onClose}
            className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-gray-300 text-center text-sm font-semibold text-ink-900"
          >
            Bountiful
          </Link>
          <Link
            href={CLINTON_LOCATION_HREF}
            onClick={onClose}
            className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-gray-300 text-center text-sm font-semibold text-ink-900"
          >
            Clinton
          </Link>
        </div>

        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 rounded-full bg-ink-900 px-6 py-3 text-center text-base font-semibold text-white"
        >
          Schedule Appointment
        </a>
      </nav>
    </div>
  );
}
