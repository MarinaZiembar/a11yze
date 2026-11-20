"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { CATEGORIES, PRINCIPLES, getCategory } from "@/lib/categories";
import { useLang } from "@/lib/i18n";
import { auditsFor, neededFor, statsFor } from "@/lib/scoring";
import { useAnalysis } from "@/lib/store";
import type { AuditResult, AuditStatus } from "@/lib/types";
import { DeviceSwitch } from "@/components/Switches";
import { ArrowBadge, Asterisk, Inline, LEVEL_DOT, Pill, Thermometer } from "@/components/ui";

const STATUS_DOT: Record<AuditStatus, string> = {
  pass: "bg-good",
  fail: "bg-bad",
  manual: "bg-violet",
  na: "bg-sand ring-1 ring-ink/20",
};

export default function CheckPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const { analysis, ready, device } = useAnalysis();
  const category = getCategory(id);

  useEffect(() => {
    if (category) document.title = `${category.title[lang]} — A11yze`;
  }, [category, lang]);

  if (!category || (ready && !analysis)) {
    return (
      <main id="main" tabIndex={-1} className="px-4 outline-none lg:px-6">
        <div className="grid min-h-[60dvh] place-items-center rounded-[2.5rem] bg-coal p-10 text-center text-cream">
          <div>
            <h1 className="text-3xl font-medium tracking-tight">{category ? t.detail.noData : t.detail.notFound}</h1>
            <Link href="/" className="card-link mt-6 inline-flex items-center gap-3 rounded-full bg-cream py-1.5 pl-5 pr-1.5 font-medium text-ink">
              {t.detail.goHome}
              <ArrowBadge tone="violet" />
            </Link>
          </div>
        </div>
      </main>
    );
  }
  if (!analysis) return <main id="main" className="min-h-[60dvh]" aria-busy="true" />;

  const report = analysis[device];
  const audits = auditsFor(report, category);
  const stats = statsFor(audits, category);
  const isManual = category.id === "manual";
  const failed = audits.filter((a) => a.status === "fail");
  const order: AuditStatus[] = ["fail", "manual", "pass", "na"];
  const sorted = [...audits].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  const idx = CATEGORIES.findIndex((c) => c.id === category.id);
  const prev = CATEGORIES[(idx - 1 + CATEGORIES.length) % CATEGORIES.length];
  const next = CATEGORIES[(idx + 1) % CATEGORIES.length];

  const heroTone =
    stats.level === "bad" ? "bg-coal text-cream" : isManual ? "bg-violet text-ink" : stats.level === "empty" ? "bg-sand text-ink" : "hero-bg text-ink";
  const heroDark = stats.level === "bad";
  const need = neededFor(stats.total);

  return (
    <main id="main" tabIndex={-1} className="px-4 pb-6 outline-none lg:px-6">
      <div className="grid gap-3 lg:h-[calc(100dvh-4.5rem-1.5rem)] lg:grid-cols-12 lg:grid-rows-2">
        {/* Intro de la categoría */}
        <section className={`relative flex flex-col overflow-hidden rounded-[2.5rem] p-6 sm:p-8 lg:col-span-5 lg:row-span-2 ${heroTone}`}>
          <Asterisk className={`pointer-events-none absolute -bottom-20 -right-20 size-80 animate-spin-slow ${heroDark ? "text-ash" : "text-ink/[0.07]"}`} />
          <Link href="/" className="group relative inline-flex w-fit items-center gap-2 rounded-full text-sm font-medium">
            <span className="grid size-8 place-items-center rounded-full border border-current/25 transition-transform group-hover:-translate-x-1" aria-hidden="true">
              ←
            </span>
            {t.detail.back}
          </Link>

          <div className="relative mt-8 flex flex-wrap gap-2">
            <Pill>{PRINCIPLES[category.principle][lang]}</Pill>
            {category.wcag.map((w) => (
              <Pill key={w}>WCAG {w}</Pill>
            ))}
          </div>
          <h1 className="relative mt-4 text-5xl font-medium leading-[0.95] tracking-tighter lg:text-6xl xl:text-7xl">{category.title[lang]}</h1>
          <p className={`relative mt-4 max-w-md text-lg leading-snug ${heroDark ? "text-mute" : ""}`}>{category.short[lang]}</p>

          <div className="relative mt-auto pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className={`size-2 rounded-full ${LEVEL_DOT[stats.level]}`} aria-hidden="true" />
                  {t.level[stats.level]}
                </p>
                <p className="mt-1 text-4xl font-medium tracking-tight">
                  {isManual ? stats.manual : stats.score !== null ? `${stats.score}%` : "—"}
                </p>
              </div>
              <DeviceSwitch tone={heroDark ? "dark" : "light"} />
            </div>
            {stats.score !== null && (
              <>
                <Thermometer value={stats.score} level={stats.level} size="lg" className="mt-4" />
                <p className="mt-2 text-sm">{t.detail.thermo(stats.pass, stats.total, need.good, need.warn)}</p>
              </>
            )}
            <nav aria-label={`${t.detail.prev} / ${t.detail.next}`} className="mt-6 flex justify-between gap-3 text-sm">
              <Link href={`/check/${prev.id}`} className="rounded-full underline-offset-4 hover:underline">
                ← {prev.title[lang]}
              </Link>
              <Link href={`/check/${next.id}`} className="rounded-full text-right underline-offset-4 hover:underline">
                {next.title[lang]} →
              </Link>
            </nav>
          </div>
        </section>

        {/* Qué analizamos */}
        <Panel title={t.detail.analyzed} className="bg-cream text-ink lg:col-span-3" delay={60}>
          <p className="text-sm leading-relaxed text-stone">{category.analyzed[lang]}</p>
          {sorted.length > 0 && (
            <ul className="mt-4 space-y-2">
              {sorted.map((a) => (
                <li key={a.id} className="flex items-start gap-2 text-sm leading-snug">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${STATUS_DOT[a.status]}`} aria-hidden="true" />
                  <span>
                    <Inline text={a.title} />
                    <span className="sr-only"> — {t.detail.status[a.status]}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Qué encontramos */}
        <Panel title={t.detail.found} className="bg-coal text-cream lg:col-span-4" delay={120}>
          {isManual ? (
            <>
              <p className="text-sm text-mute">{t.detail.manualIntro}</p>
              <ul className="mt-3 space-y-3">
                {audits.map((a) => (
                  <li key={a.id} className="rounded-2xl bg-ash p-3 text-sm">
                    <p className="font-medium">
                      <Inline text={a.title} />
                    </p>
                    {a.description && <p className="mt-1 text-mute">{a.description}</p>}
                  </li>
                ))}
              </ul>
            </>
          ) : failed.length ? (
            <ul className="space-y-3">
              {failed.map((a) => (
                <Finding key={a.id} audit={a} />
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-mute">{stats.level === "empty" ? t.detail.noneApplicable : t.detail.none}</p>
          )}
        </Panel>

        {/* Cómo solucionarlo */}
        <Panel title={t.detail.fix} className="bg-cream text-ink lg:col-span-4" delay={180}>
          <ol className="space-y-3">
            {category.strategies[lang].map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-cream" aria-hidden="true">
                  {i + 1}
                </span>
                <span>
                  <Inline text={s} />
                </span>
              </li>
            ))}
          </ol>
        </Panel>

        {/* Recursos */}
        <Panel title={t.detail.resources} className="bg-violet text-ink lg:col-span-3" delay={240}>
          <ul className="space-y-2">
            {category.resources.map((r) => (
              <li key={r.href}>
                <a href={r.href} target="_blank" rel="noreferrer" className="card-link flex items-center justify-between gap-3 rounded-2xl bg-cream/90 p-3 text-sm font-medium">
                  <span>
                    {r.label[lang]}
                    <span className="sr-only"> {t.dash.opensNew}</span>
                  </span>
                  <ArrowBadge />
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </main>
  );
}

function Panel({ title, className, delay, children }: { title: string; className: string; delay: number; children: React.ReactNode }) {
  const headingId = `panel-${title.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <section aria-labelledby={headingId} className={`animate-rise flex min-h-0 flex-col rounded-[2rem] p-6 ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <h2 id={headingId} className="mb-4 text-2xl font-medium tracking-tight">
        {title}
      </h2>
      {/* Región scrolleable enfocable con teclado (requisito de accesibilidad) */}
      <div tabIndex={0} role="region" aria-labelledby={headingId} className="scroll-thin -mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
        {children}
      </div>
    </section>
  );
}

function Finding({ audit: a }: { audit: AuditResult }) {
  const { t } = useLang();
  return (
    <li className="rounded-2xl bg-ash p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium leading-snug">
          <Inline text={a.title} />
        </p>
        {a.total > 0 && <span className="shrink-0 rounded-full bg-violet px-2 py-0.5 text-xs font-semibold text-ink">{t.detail.elements(a.total)}</span>}
      </div>
      {a.items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {a.items.slice(0, 3).map((it, i) => (
            <li key={i}>
              {it.snippet && <code className="block overflow-x-auto whitespace-pre rounded-lg bg-ink px-2.5 py-1.5 font-mono text-xs text-sand">{it.snippet}</code>}
              {it.explanation && <p className="mt-1 text-xs text-mute">{it.explanation}</p>}
            </li>
          ))}
          {a.total > 3 && <li className="text-xs text-mute">{t.detail.more(a.total - 3)}</li>}
        </ul>
      )}
      {a.docsUrl && (
        <a href={a.docsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-violet underline underline-offset-4">
          {t.detail.docs}
          <span className="sr-only"> {t.dash.opensNew}</span>
        </a>
      )}
    </li>
  );
}
