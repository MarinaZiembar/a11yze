"use client";

import { useLang } from "@/lib/i18n";
import { useAnalysis } from "@/lib/store";
import type { Device, Lang } from "@/lib/types";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

/** Control segmentado con indicador que se desliza. Botones con aria-pressed. */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  tone = "dark",
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  tone?: "dark" | "light";
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const shell = tone === "dark" ? "bg-ink text-cream ring-1 ring-cream/15" : "bg-ink/10 text-ink";
  const thumb = tone === "dark" ? "bg-cream" : "bg-ink";
  const active = tone === "dark" ? "text-ink" : "text-cream";

  return (
    <div role="group" aria-label={label} className={`relative inline-grid rounded-full p-1 ${shell}`} style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 rounded-full transition-transform duration-300 ease-out ${thumb}`}
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${idx * 100}%)` }}
      />
      {options.map((o) => {
        const isActive = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(o.value)}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 ${isActive ? active : ""}`}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function LangSwitch() {
  const { lang, setLang, t } = useLang();
  return (
    <Segmented<Lang>
      label={t.langLabel}
      value={lang}
      onChange={setLang}
      options={[
        { value: "es", label: "ES" },
        { value: "en", label: "EN" },
      ]}
    />
  );
}

const PhoneIcon = (
  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="4.5" y="1.5" width="7" height="13" rx="2" />
    <path d="M7 12.5h2" strokeLinecap="round" />
  </svg>
);
const DesktopIcon = (
  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.5" />
    <path d="M5.5 14h5M8 11v3" strokeLinecap="round" />
  </svg>
);

export function DeviceSwitch({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { t } = useLang();
  const { device, setDevice } = useAnalysis();
  return (
    <Segmented<Device>
      label={t.dash.device}
      value={device}
      onChange={setDevice}
      tone={tone}
      options={[
        { value: "desktop", label: t.dash.desktop, icon: DesktopIcon },
        { value: "mobile", label: t.dash.mobile, icon: PhoneIcon },
      ]}
    />
  );
}
