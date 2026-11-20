"use client";

import { useLang } from "@/lib/i18n";

export function SkipLink() {
  const { t } = useLang();
  return (
    <a
      href="#main"
      className="fixed left-4 top-3 z-[60] -translate-y-24 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink transition-transform focus:translate-y-0"
    >
      {t.skip}
    </a>
  );
}
