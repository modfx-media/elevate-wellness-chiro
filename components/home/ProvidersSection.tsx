import Image from "next/image";
import type { CSSProperties } from "react";
import { MotionLink } from "@/components/home/MotionLink";
import type { Provider } from "@/components/home/homepage-data";

function Avatar({ provider }: { provider: Provider }) {
  if (provider.image) {
    return (
      <Image
        src={provider.image}
        alt={provider.name}
        fill
        sizes="(min-width: 1024px) 33vw, 100vw"
        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  const initials = provider.name
    .replace("Dr. ", "")
    .split(" ")
    .map((part) => part[0])
    .join("");
  return (
    <div className="flex h-full w-full items-center justify-center bg-primary-100">
      <span className="font-display text-5xl font-bold text-primary-600">{initials}</span>
    </div>
  );
}

export function ProvidersSection({
  heading,
  providers,
}: {
  heading: string;
  providers: Provider[];
}) {
  const single = providers.length === 1;

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-24 lg:px-8">
      <div className="reveal flex items-center justify-center gap-3">
        <span aria-hidden className="h-px w-10 bg-primary-500/60" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
          Our Team
        </span>
        <span aria-hidden className="h-px w-10 bg-primary-500/60" />
      </div>
      <h2 className="reveal mt-4 text-center font-display text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
        {heading}
      </h2>

      <div
        className={`mx-auto mt-14 grid gap-8 ${
          single ? "max-w-3xl grid-cols-1" : "sm:grid-cols-2"
        }`}
      >
        {providers.map((provider, i) => (
          <MotionLink
            key={provider.name}
            href={provider.href}
            className={`group reveal flex overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl ${
              single ? "flex-col sm:flex-row" : "flex-col"
            }`}
            style={{ "--reveal-delay": `${i * 100}ms` } as CSSProperties}
          >
            <div
              className={`relative overflow-hidden bg-primary-100 ${
                single ? "aspect-[4/3] sm:aspect-auto sm:w-2/5" : "aspect-[4/3] w-full"
              }`}
            >
              <Avatar provider={provider} />
            </div>
            <div className="flex flex-1 flex-col justify-center p-7 lg:p-8">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-100/70 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-accent">
                {provider.role}
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink-900">
                {provider.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">{provider.body}</p>
              <span className="mt-5 inline-flex w-fit items-center gap-1 text-sm font-semibold text-accent">
                Meet {provider.name.replace("Dr. ", "")}
                <span
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </span>
            </div>
          </MotionLink>
        ))}
      </div>
    </section>
  );
}
