"use client";

import Link from "next/link";
import { CATEGORIES, PRINCIPLES, type Category } from "@/lib/categories";
import { useLang } from "@/lib/i18n";
import { auditsFor, levelFor, overallScore, statsFor, type CategoryStats } from "@/lib/scoring";
import { useAnalysis } from "@/lib/store";
import type { DeviceReport, Level } from "@/lib/types";
import { ArrowBadge, Asterisk, LEVEL_DOT, Pill, Thermometer, useCountUp } from "./ui";
import { DeviceSwitch } from "./Switches";
import { PdfButton } from "./PdfButton";

/** Tarjetas claras; las de nivel bajo (rojo) van en negro y la de revisión manual en violeta. */
const CARD_TONE: Record<Level, string> = {
  bad: "bg-coal text-cream",
  warn: "bg-cream text-ink",
  good: "bg-cream text-ink",
  empty: "bg-sand/70 text-ink",
  manual: "bg-violet text-ink",
};

export function Dashboard() {
  const { t, lang } = useLang();
  const { analysis, device, reset } = useAnalysis();
  if (!analysis) return null;

  const report = analysis[device];
  const host = new URL(report.finalUrl || analysis.url).host;
  const time = new Date(analysis.analyzedAt).toLocaleString(lang === "es" ? "es-AR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main id="main" tabIndex={-1} className="px-4 pb-6 outline-none lg:px-6">
      <h1 className="sr-only">
        {t.dash.results} {host}
      </h1>
      <section className="flex flex-col gap-3 lg:h-[calc(100dvh-4.5rem-1.5rem)]">
        {/* Toolbar
            Mobile:  info · [Nuevo análisis][Descargar PDF] · toggle a la izquierda
            Desktop: [Nuevo análisis][Descargar PDF] info ............ toggle (una sola fila) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="order-2 flex flex-wrap items-center gap-2 lg:order-1">
            <button
              type="button"
              onClick={reset}
              className="group inline-flex items-center gap-2 rounded-full border border-ink/20 py-2 pl-3.5 pr-4 text-sm font-medium transition-colors hover:bg-ink hover:text-cream"
            >
              <svg
                viewBox="0 0 16 16"
                className="size-4 transition-transform duration-500 group-hover:-rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2.75 8a5.25 5.25 0 1 0 1.6-3.77" />
                <path d="M2.5 2.5v3h3" />
              </svg>
              {t.dash.newAnalysis}
            </button>
            <PdfButton />
          </div>

          <div className="order-1 flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-1 lg:order-2 lg:w-auto lg:flex-1 lg:pl-2">
            <span className="text-sm text-stone">{t.dash.results}</span>
            <a
              href={report.finalUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate rounded-full bg-ink px-3 py-1 text-sm font-medium text-cream underline-offset-4 hover:underline"
            >
              {host}
              <span className="sr-only"> {t.dash.opensNew}</span>
            </a>
            <span className="text-xs text-stone">
              {t.dash.analyzedAt} {time}
            </span>
          </div>

          <div className="order-3 flex w-full justify-start lg:w-auto">
            <DeviceSwitch />
          </div>
        </div>

        {/* Grid de tarjetas: en desktop entra todo en el alto de la pantalla */}
        <ul
          key={device /* re-anima al cambiar de dispositivo */}
          className="grid flex-1 auto-rows-[minmax(13rem,auto)] gap-3 sm:grid-cols-2 lg:min-h-0 lg:grid-cols-4 lg:grid-rows-3 lg:auto-rows-auto"
        >
          <li className="animate-rise sm:col-span-2 lg:col-span-1 lg:row-span-2">
            <ScoreCard report={report} />
          </li>
          {CATEGORIES.map((c, i) => {
            const stats = statsFor(auditsFor(report, c), c);
            return (
              <li key={c.id} className="animate-rise lg:min-h-0" style={{ animationDelay: `${60 + i * 45}ms` }}>
                <CategoryCard category={c} stats={stats} index={i + 1} />
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

function ScoreCard({ report }: { report: DeviceReport }) {
  const { t } = useLang();
  const own = overallScore(report);
  const score = own ?? 0;
  const level = levelFor(own);
  const shown = useCountUp(score);
  const counts = report.audits.reduce(
    (acc, a) => ({ ...acc, [a.status]: acc[a.status] + 1 }),
    { pass: 0, fail: 0, manual: 0, na: 0 },
  );
  const verdict = level === "good" ? t.dash.verdict.great : level === "warn" ? t.dash.verdict.ok : t.dash.verdict.low;

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-coal p-6 text-cream">
      <Asterisk className="pointer-events-none absolute -right-20 -top-20 size-56 animate-spin-slow text-ash/70" />
      <h2 className="relative text-sm font-medium text-mute">{t.dash.overall}</h2>
      <p className="relative mt-2 flex items-baseline gap-2">
        <span className="text-[clamp(4.5rem,9vw,8.5rem)] font-medium leading-none tracking-tighter">{shown}</span>
        <span className="text-mute">{t.dash.outOf}</span>
      </p>
      <Thermometer value={score} level={level} size="lg" className="relative mt-4 text-cream" />
      <p className="relative mt-4 text-lg leading-snug">{verdict}</p>
      {report.score !== null && (
        <p className="relative mt-2 text-xs text-mute">
          {t.dash.lighthouse}: {report.score}/100 · {t.dash.lighthouseNote}
        </p>
      )}

      <dl className="relative mt-auto grid grid-cols-3 gap-2 pt-6">
        {(
          [
            ["fail", t.dash.fail, "bg-bad"],
            ["pass", t.dash.pass, "bg-good"],
            ["manual", t.dash.manual, "bg-violet"],
          ] as const
        ).map(([k, label, dot]) => (
          <div key={k} className="rounded-2xl bg-ash p-3">
            <dt className="flex items-center gap-1.5 text-xs text-mute">
              <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
              {label}
            </dt>
            <dd className="mt-1 text-2xl font-medium">{counts[k]}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function CategoryCard({ category: c, stats, index }: { category: Category; stats: CategoryStats; index: number }) {
  const { t, lang } = useLang();
  const tone = CARD_TONE[stats.level];
  const dark = stats.level === "bad";

  const summary =
    stats.level === "manual"
      ? `${stats.manual} ${t.dash.checks}`
      : stats.level === "empty"
        ? t.detail.status.na
        : t.dash.passOf(stats.pass, stats.total);

  return (
    <Link href={`/check/${c.id}`} className={`card-link flex h-full flex-col overflow-hidden rounded-[2rem] p-5 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <Pill>{PRINCIPLES[c.principle][lang]}</Pill>
        <ArrowBadge tone={dark ? "violet" : "ink"} />
      </div>
      <h2 className="mt-3 text-[1.6rem] font-medium leading-[1.05] tracking-tight xl:text-3xl short:text-2xl">
        <span className="tabular-nums opacity-50">{index}.</span> {c.title[lang]}
      </h2>
      <p className={`mt-1 line-clamp-2 text-sm ${dark ? "text-mute" : stats.level === "manual" ? "text-ink" : "text-stone"} lg:max-xl:hidden short:hidden`}>
        {c.short[lang]}
      </p>
      <div className="mt-auto pt-3">
        <div className="flex items-center justify-between gap-2 text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${LEVEL_DOT[stats.level]}`} aria-hidden="true" />
            {t.level[stats.level]}
          </span>
          <span className={dark ? "text-mute" : ""}>{summary}</span>
        </div>
        {stats.score !== null && <Thermometer value={stats.score} level={stats.level} className="mt-2.5" />}
        <span className="sr-only">{t.dash.viewMore}</span>
      </div>
    </Link>
  );
}
