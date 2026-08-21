import type { CSSProperties } from "react";

interface OfficeHours {
  label: string;
  value: string;
}

interface OfficeLocation {
  name: string;
  address: string;
  phone: string;
  telHref: string;
  hours: OfficeHours[];
  mapSrc: string;
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5 shrink-0 text-primary-600">
      <path
        d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5 shrink-0 text-primary-600">
      <path
        d="M6.5 3.5 9 4l1 3.5-1.8 1.4a12 12 0 0 0 5.4 5.4L15 16.5 18.5 15l.5 2.5a2 2 0 0 1-2 2.4A14 14 0 0 1 3.6 6a2 2 0 0 1 2.4-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5 shrink-0 text-primary-600">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function LocationsMap({ locations }: { locations: OfficeLocation[] }) {
  return (
    <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
      {locations.map((location, i) => (
        <div
          key={location.name}
          className="reveal overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg"
          style={{ "--reveal-delay": `${i * 120}ms` } as CSSProperties}
        >
          <div className="relative aspect-[16/9] w-full bg-gray-100">
            <iframe
              src={location.mapSrc}
              title={`Map of ${location.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>

          <div className="p-7 lg:p-8">
            <h3 className="font-display text-xl font-semibold text-ink-900">{location.name}</h3>

            <ul className="mt-5 space-y-4 text-sm text-ink-700">
              <li className="flex items-start gap-3">
                <PinIcon />
                <span>{location.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <PhoneIcon />
                <a
                  href={location.telHref}
                  className="font-semibold text-ink-900 transition-colors hover:text-primary-600"
                >
                  {location.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <ClockIcon />
                <div className="w-full space-y-1">
                  {location.hours.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                      <span className="font-medium text-ink-900">{row.label}</span>
                      <span className="text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </li>
            </ul>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-primary-600"
            >
              Get directions &rarr;
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
