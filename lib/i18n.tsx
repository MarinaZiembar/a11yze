"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { ErrorCode, Lang, Level } from "./types";

const es = {
  skip: "Saltar al contenido",
  langLabel: "Idioma",
  home: "A11yze, nuevo análisis",
  hero: {
    kicker: "Auditoría de accesibilidad web",
    title1: "¿Qué tan",
    title2: "accesible",
    title3: "es tu web?",
    lead: "Pegá una URL y revisamos imágenes, contraste, teclado, formularios, ARIA y más — en mobile y desktop — según los fundamentos de accesibilidad de la W3C.",
    label: "URL del sitio a analizar",
    placeholder: "tusitio.com",
    cta: "Analizar",
    loading: "Analizando…",
    steps: [
      "Abriendo la página en mobile y desktop…",
      "Buscando textos alternativos…",
      "Midiendo el contraste de colores…",
      "Revisando encabezados y landmarks…",
      "Chequeando nombres de links y botones…",
      "Validando roles y atributos ARIA…",
      "Armando tu reporte…",
    ],
    wait: "Puede tardar hasta un minuto: corremos Lighthouse dos veces.",
    willAnalyze: "Vamos a analizar",
    invalidHint: "Escribí un dominio completo, por ejemplo ejemplo.com",
    facts: [
      { big: "1 de 6", text: "personas en el mundo vive con una discapacidad significativa (OMS)." },
      { big: "4", text: "principios: perceptible, operable, comprensible y robusto." },
      { big: "2", text: "vistas analizadas por separado: mobile y desktop." },
    ],
  },
  dash: {
    results: "Resultados para",
    analyzedAt: "Analizado",
    newAnalysis: "Nuevo análisis",
    device: "Dispositivo",
    mobile: "Mobile",
    desktop: "Desktop",
    overall: "Puntaje general",
    outOf: "de 100",
    pass: "pasan",
    fail: "fallan",
    manual: "a revisar",
    checks: "chequeos",
    passOf: (p: number, t: number) => `pasan ${p} de ${t}`,
    pdf: "Descargar PDF",
    pdfLoading: "Generando PDF…",
    pdfError: "No pudimos generar el PDF. Probá de nuevo.",
    viewMore: "Ver más",
    opensNew: "(se abre en una pestaña nueva)",
    verdict: {
      great: "Muy buena base. Queda pulir detalles.",
      ok: "Va bien, pero hay barreras importantes.",
      low: "Hay varias barreras para muchas personas.",
    },
  },
  level: {
    good: "Bien",
    warn: "Mejorable",
    bad: "Con problemas",
    empty: "Sin elementos",
    manual: "Revisión manual",
  } satisfies Record<Level, string>,
  detail: {
    back: "Volver al análisis",
    analyzed: "Qué analizamos",
    found: "Qué encontramos",
    fix: "Cómo solucionarlo",
    resources: "Recursos útiles",
    none: "No encontramos problemas automáticos en esta categoría. Igual vale la pena una revisión manual.",
    noneApplicable: "No había elementos de este tipo en la página.",
    manualIntro: "Puntos a revisar a mano:",
    elements: (n: number) => (n === 1 ? "1 elemento" : `${n} elementos`),
    more: (n: number) => `y ${n} más`,
    docs: "Documentación de la regla",
    prev: "Anterior",
    next: "Siguiente",
    status: { pass: "Pasa", fail: "Falla", manual: "Manual", na: "No aplica" },
    noData: "Todavía no hay ningún análisis.",
    thermo: (pass: number, total: number, good: number, warn: number) =>
      `Pasan ${pass} de ${total}. Verde desde ${good}, amarillo desde ${warn}.`,
    goHome: "Analizar una web",
    notFound: "Esta categoría no existe.",
  },
  errors: {
    invalid: "Esa URL no parece válida. Probá con algo como ejemplo.com",
    quota: "Llegamos al límite de análisis de la API. Probá de nuevo en unos minutos.",
    unreachable: "No pudimos abrir esa página. ¿Está publicada y es pública?",
    generic: "Algo salió mal. Probá de nuevo.",
  } satisfies Record<ErrorCode, string>,
  footer: {
    cta: "¿Querés que tu sitio sea accesible de verdad?",
    talk: "Escribime",
    built: "Desarrollado por",
    rights: "Todos los derechos reservados.",
    powered: "Análisis con Lighthouse vía PageSpeed Insights · Basado en",
    wai: "W3C WAI",
  },
};

type Dict = typeof es;

const en: Dict = {
  skip: "Skip to content",
  langLabel: "Language",
  home: "A11yze, new analysis",
  hero: {
    kicker: "Web accessibility audit",
    title1: "How",
    title2: "accessible",
    title3: "is your site?",
    lead: "Paste a URL and we’ll check images, contrast, keyboard, forms, ARIA and more — on mobile and desktop — based on the W3C accessibility fundamentals.",
    label: "URL of the site to analyze",
    placeholder: "yoursite.com",
    cta: "Analyze",
    loading: "Analyzing…",
    steps: [
      "Opening the page on mobile and desktop…",
      "Looking for text alternatives…",
      "Measuring color contrast…",
      "Checking headings and landmarks…",
      "Checking link and button names…",
      "Validating ARIA roles and attributes…",
      "Putting your report together…",
    ],
    wait: "It can take up to a minute: we run Lighthouse twice.",
    willAnalyze: "We’ll analyze",
    invalidHint: "Type a full domain, for example example.com",
    facts: [
      { big: "1 in 6", text: "people worldwide live with a significant disability (WHO)." },
      { big: "4", text: "principles: perceivable, operable, understandable and robust." },
      { big: "2", text: "views analyzed separately: mobile and desktop." },
    ],
  },
  dash: {
    results: "Results for",
    analyzedAt: "Analyzed",
    newAnalysis: "New analysis",
    device: "Device",
    mobile: "Mobile",
    desktop: "Desktop",
    overall: "Overall score",
    outOf: "out of 100",
    pass: "pass",
    fail: "fail",
    manual: "to review",
    checks: "checks",
    passOf: (p: number, t: number) => `${p} of ${t} pass`,
    pdf: "Download PDF",
    pdfLoading: "Generating PDF…",
    pdfError: "We couldn’t generate the PDF. Please try again.",
    viewMore: "See more",
    opensNew: "(opens in a new tab)",
    verdict: {
      great: "Solid foundation. Some details to polish.",
      ok: "Going well, but there are important barriers.",
      low: "There are several barriers for many people.",
    },
  },
  level: { good: "Good", warn: "Could improve", bad: "Has issues", empty: "Nothing found", manual: "Manual review" },
  detail: {
    back: "Back to results",
    analyzed: "What we checked",
    found: "What we found",
    fix: "How to fix it",
    resources: "Useful resources",
    none: "No automated issues found in this category. A manual review is still worth it.",
    noneApplicable: "The page had no elements of this kind.",
    manualIntro: "Points to check by hand:",
    elements: (n: number) => (n === 1 ? "1 element" : `${n} elements`),
    more: (n: number) => `and ${n} more`,
    docs: "Rule documentation",
    prev: "Previous",
    next: "Next",
    status: { pass: "Pass", fail: "Fail", manual: "Manual", na: "N/A" },
    noData: "There’s no analysis yet.",
    thermo: (pass: number, total: number, good: number, warn: number) =>
      `${pass} of ${total} pass. Green from ${good}, yellow from ${warn}.`,
    goHome: "Analyze a site",
    notFound: "This category doesn’t exist.",
  },
  errors: {
    invalid: "That URL doesn’t look valid. Try something like example.com",
    quota: "We hit the API’s analysis limit. Please try again in a few minutes.",
    unreachable: "We couldn’t open that page. Is it published and public?",
    generic: "Something went wrong. Please try again.",
  },
  footer: {
    cta: "Want your site to be truly accessible?",
    talk: "Get in touch",
    built: "Built by",
    rights: "All rights reserved.",
    powered: "Analysis with Lighthouse via PageSpeed Insights · Based on",
    wai: "W3C WAI",
  },
};

export const DICTS: Record<Lang, Dict> = { es, en };

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const Ctx = createContext<LangCtx | null>(null);
const KEY = "a11yze:lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "es" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  // Mantener <html lang> sincronizado: clave para lectores de pantalla.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  }, []);

  return <Ctx.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
