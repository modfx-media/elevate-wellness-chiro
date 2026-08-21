"use client";

import type { faqItems } from "./homepage-data";

export function FaqAccordion({ items }: { items: typeof faqItems }) {
  return (
    <div className="divide-y divide-gray-300">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ink-900">
            {item.question}
            <span
              aria-hidden
              className="shrink-0 text-primary-600 transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 leading-relaxed text-ink-700">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
