"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useAnalysis } from "@/lib/store";
import { Asterisk } from "./ui";
import { LangSwitch } from "./Switches";

export function Header() {
  const { t } = useLang();
  const { reset } = useAnalysis();
  return (
    <header className="flex h-[4.5rem] items-center justify-between px-4 lg:px-6">
      <Link href="/" onClick={reset} aria-label={t.home} className="group flex items-center gap-2.5 rounded-full text-xl font-semibold tracking-tight">
        <span className="grid size-9 place-items-center rounded-xl bg-lime text-ink">
          <Asterisk className="size-5 transition-transform duration-500 group-hover:rotate-90" />
        </span>
        A11yze
      </Link>
      <LangSwitch />
    </header>
  );
}
