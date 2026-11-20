"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useAnalysis } from "@/lib/store";
import { ArrowBadge, Asterisk } from "./ui";

export function Hero() {
  const { t, lang } = useLang();
  const { analyze, loading, error } = useAnalysis();
  const [url, setUrl] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) return setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, t.hero.steps.length - 1)), 4500);
    return () => clearInterval(id);
  }, [loading, t.hero.steps.length]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !loading) analyze(url, lang);
  };

  return (
    <main id="main" tabIndex={-1} className="px-4 pb-6 outline-none lg:px-6">
      <section className="hero-bg relative flex min-h-[calc(100dvh-6rem)] flex-col items-center overflow-hidden rounded-[2.5rem] p-6 text-center text-ink sm:p-10 lg:p-14">
        {/* Ornamentos sutiles */}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
          <Asterisk className="size-[26rem] animate-spin-slow text-ink/[0.08] lg:size-[38rem]" />
        </div>
        <p aria-hidden="true" className="ghost-text pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 select-none text-[22vw] font-semibold leading-none tracking-tighter lg:-bottom-10">
          A11YZE
        </p>

        <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/25 px-3 py-1 text-sm font-medium">
            <span className="size-1.5 rounded-full bg-ink" aria-hidden="true" />
            {t.hero.kicker}
          </p>
          <h1 className="text-5xl font-medium leading-[0.95] tracking-tighter sm:text-6xl lg:text-8xl">
            {t.hero.title1} <span className="italic">{t.hero.title2}</span>
            <br />
            {t.hero.title3}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed sm:text-lg">{t.hero.lead}</p>

          <form onSubmit={onSubmit} className="mx-auto mt-8 w-full max-w-xl" noValidate>
            <label htmlFor="url" className="mb-2 block text-sm font-semibold">
              {t.hero.label}
            </label>
            <div className="flex flex-col gap-2 rounded-[1.75rem] bg-cream p-1.5 sm:flex-row sm:rounded-full">
              <input
                id="url"
                name="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.hero.placeholder}
                aria-invalid={error === "invalid" || undefined}
                aria-describedby={error ? "url-error" : undefined}
                disabled={loading}
                className="min-w-0 flex-1 rounded-full bg-transparent px-5 py-3 text-lg text-ink placeholder:text-umber"
              />
              <button
                type="submit"
                disabled={loading}
                className="card-link inline-flex items-center justify-center gap-3 rounded-full bg-ink py-1.5 pl-6 pr-1.5 font-semibold text-cream disabled:opacity-70"
              >
                {loading ? t.hero.loading : t.hero.cta}
                <ArrowBadge tone="flame" />
              </button>
            </div>

            <div aria-live="polite" className="mt-4 min-h-14">
              {loading && (
                <div className="mx-auto max-w-md">
                  <p className="font-medium">{t.hero.steps[step]}</p>
                  <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-ink/15" aria-hidden="true">
                    <span className="absolute inset-y-0 w-1/3 animate-shimmer rounded-full bg-ink" />
                  </div>
                  <p className="mt-2 text-sm">{t.hero.wait}</p>
                </div>
              )}
              {error && !loading && (
                <p id="url-error" role="alert" className="inline-flex rounded-2xl bg-ink px-4 py-2 text-sm font-medium text-cream">
                  {t.errors[error]}
                </p>
              )}
            </div>
          </form>
        </div>

        <ul className="relative mx-auto grid w-full gap-3 pt-10 sm:grid-cols-3 lg:max-w-4xl">
          {t.hero.facts.map((f, i) => (
            <li key={f.big} className="animate-rise rounded-[1.75rem] bg-cream p-5" style={{ animationDelay: `${200 + i * 90}ms` }}>
              <p className="text-4xl font-medium tracking-tight">{f.big}</p>
              <p className="mt-6 text-sm leading-snug text-umber">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
