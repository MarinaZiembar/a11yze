"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { useAnalysis } from "@/lib/store";
import { ArrowBadge, Asterisk } from "./ui";

const CAFECITO = "https://cafecito.app/holaasoymaru";

/** Genera el PDF en el navegador (pdf-lib se carga recién al hacer click), lo descarga y abre la modal de agradecimiento. */
export function PdfButton() {
  const { t, lang } = useLang();
  const { analysis } = useAnalysis();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  const onClick = async () => {
    if (!analysis || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const { buildReportPdf, reportFileName } = await import("@/lib/pdf");
      const bytes = await buildReportPdf(analysis, lang);
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = reportFileName(analysis);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setOpen(true);
    } catch (err) {
      console.error("[a11yze] pdf failed", err);
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-busy={busy}
        className="card-link inline-flex items-center gap-2 rounded-full bg-lime py-2 pl-3.5 pr-4 text-sm font-semibold text-ink disabled:opacity-70"
      >
        <svg viewBox="0 0 16 16" className={`size-4 ${busy ? "animate-bounce" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
        </svg>
        {busy ? t.dash.pdfLoading : t.dash.pdf}
      </button>
      <span role="status" className="sr-only">
        {busy ? t.dash.pdfLoading : ""}
      </span>
      {failed && (
        <p role="alert" className="w-full text-sm font-medium text-ink sm:w-auto">
          {t.dash.pdfError}
        </p>
      )}
      <ThanksModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Modal con <dialog> nativo: trae foco atrapado, cierre con Esc y fondo inerte sin librerías. */
function ThanksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  const m = t.dash.modal;
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState("https://a11yze.vercel.app");

  useEffect(() => setSiteUrl(window.location.origin), []);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const shareText = `${m.shareText} ${siteUrl}`;
  const shares = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(shareText)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}` },
    { label: "X", href: `https://x.com/intent/post?text=${encodeURIComponent(shareText)}` },
  ];

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "A11yze", text: m.shareText, url: siteUrl });
        return;
      } catch {
        /* cancelado: seguimos con copiar */
      }
    }
    copy();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="thanks-title"
      aria-describedby="thanks-body"
      className="m-auto w-[min(32rem,calc(100%-2rem))] overflow-visible bg-transparent p-0 text-ink backdrop:bg-ink/50 backdrop:backdrop-blur-sm open:animate-rise"
    >
      <div className="hero-bg relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
        <Asterisk className="pointer-events-none absolute -right-12 -top-12 size-44 animate-spin-slow text-ink/10" />
        <button
          type="button"
          onClick={onClose}
          aria-label={m.close}
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-ink text-cream transition-transform hover:rotate-90"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>

        <h2 id="thanks-title" className="relative pr-10 text-4xl font-medium leading-none tracking-tight">
          {m.title}
        </h2>
        <p id="thanks-body" className="relative mt-3 max-w-sm text-base leading-snug">
          {m.body}
        </p>

        <FeedbackForm />

        <div className="relative mt-6 rounded-2xl bg-white/60 p-4 ring-1 ring-ink/5">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={share} className="rounded-full bg-violet px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5">
              {m.share}
            </button>
            <button type="button" onClick={copy} className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-cream">
              {copied ? m.copied : m.copy}
            </button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {shares.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="font-medium underline decoration-violet decoration-2 underline-offset-4 hover:decoration-ink">
                  {s.label}
                  <span className="sr-only"> {t.dash.opensNew}</span>
                </a>
              </li>
            ))}
          </ul>
          <span role="status" className="sr-only">
            {copied ? m.copied : ""}
          </span>
        </div>

        <p className="relative mt-5 text-center text-[10px] leading-tight text-stone">
          {m.coffee}{" "}
          <a href={CAFECITO} target="_blank" rel="noreferrer" className="font-semibold text-ink underline underline-offset-2">
            cafecito.app/holaasoymaru
            <span className="sr-only"> {t.dash.opensNew}</span>
          </a>
        </p>
      </div>
    </dialog>
  );
}

type FormState = "idle" | "sending" | "sent" | "error";
type FormError = "empty" | "email" | "rate" | "generic";

/** Form de feedback: POST a /api/feedback, que lo envía con Resend. */
function FeedbackForm() {
  const { t, lang } = useLang();
  const m = t.dash.modal;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState<FormError | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    if (message.trim().length < 2) {
      setError("empty");
      setState("error");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website, lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = data?.error;
        setError(code === "empty" || code === "email" || code === "rate" ? code : "generic");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setError("generic");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <p role="status" className="relative mt-6 rounded-2xl bg-ink px-4 py-3 text-base font-medium text-cream">
        {m.sent}
      </p>
    );
  }

  const input = "w-full rounded-2xl bg-white/80 px-4 py-2.5 text-base text-ink ring-1 ring-ink/10 placeholder:text-stone";

  return (
    <form className="relative mt-6 space-y-3" onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="fb-msg" className="mb-1.5 block text-sm font-semibold">
          {m.msgLabel}
        </label>
        <textarea
          id="fb-msg"
          rows={3}
          required
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={m.msgPlaceholder}
          aria-invalid={error === "empty" || undefined}
          aria-describedby={error ? "fb-error" : undefined}
          className={`${input} resize-none py-3`}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="fb-name" className="mb-1.5 block text-xs font-semibold">
            {m.nameLabel}
          </label>
          <input id="fb-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={input} />
        </div>
        <div>
          <label htmlFor="fb-email" className="mb-1.5 block text-xs font-semibold">
            {m.emailLabel}
          </label>
          <input
            id="fb-email"
            type="email"
            autoComplete="email"
            maxLength={120}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error === "email" || undefined}
            aria-describedby={error ? "fb-error" : undefined}
            className={input}
          />
        </div>
      </div>
      {/* Honeypot: invisible para personas y lectores de pantalla */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="fb-website">Website</label>
        <input id="fb-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state === "sending"}
          className="card-link inline-flex items-center gap-3 rounded-full bg-ink py-1.5 pl-5 pr-1.5 text-sm font-semibold text-cream disabled:opacity-70"
        >
          {state === "sending" ? m.sending : m.send}
          <ArrowBadge tone="violet" />
        </button>
        {error && (
          <p id="fb-error" role="alert" className="text-sm font-medium">
            {m.formErrors[error]}
          </p>
        )}
      </div>
    </form>
  );
}
