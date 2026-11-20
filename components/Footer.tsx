"use client";

import { useLang } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { ArrowBadge, Asterisk } from "./ui";

export function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="px-4 pb-6 pt-10 lg:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-coal p-6 text-cream lg:p-10">
        <Asterisk className="pointer-events-none absolute -right-10 -top-10 size-52 animate-spin-slow text-ash" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-3xl font-medium leading-tight tracking-tight lg:text-4xl">
              {t.footer.cta.split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-violet">{t.footer.cta.split(" ").slice(-2).join(" ")}</span>
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="card-link mt-6 inline-flex items-center gap-3 rounded-full bg-cream py-1.5 pl-5 pr-1.5 font-medium text-ink"
            >
              {t.footer.talk} · {SITE.email}
              <ArrowBadge tone="violet" />
            </a>
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            {SITE.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer" className="group inline-flex gap-2 rounded-md">
                  <span className="text-mute">{l.label}</span>
                  <span className="underline decoration-violet underline-offset-4 group-hover:text-violet">{l.handle}</span>
                  <span className="sr-only">{t.dash.opensNew}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 px-2 text-xs text-stone sm:flex-row sm:justify-between">
        <p>
          © {year} {SITE.name} · {t.footer.built} {SITE.author}. {t.footer.rights}
        </p>
        <p>
          {t.footer.powered}{" "}
          <a href="https://www.w3.org/WAI/fundamentals/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
            {t.footer.wai}
            <span className="sr-only"> {t.dash.opensNew}</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
