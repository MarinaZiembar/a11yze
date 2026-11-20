"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { useAnalysis } from "@/lib/store";

/** Genera el PDF en el navegador (pdf-lib se carga recién al hacer click) y lo descarga. */
export function PdfButton() {
  const { t, lang } = useLang();
  const { analysis } = useAnalysis();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

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
    </>
  );
}
