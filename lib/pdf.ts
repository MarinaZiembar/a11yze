/**
 * Reporte PDF de A11yze, generado en el navegador con pdf-lib.
 * No es una captura de pantalla: es un documento diseñado aparte con la misma estética
 * (papel claro, lima, violeta, negro, tarjetas muy redondeadas, termómetros).
 */
import { LineCapStyle, PDFDocument, PDFName, PDFString, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { CATEGORIES, PRINCIPLES, type Category } from "./categories";
import { auditsFor, levelFor, overallScore, statsFor, THRESHOLDS, type CategoryStats } from "./scoring";
import { SITE } from "./site";
import type { Analysis, AuditResult, Device, Lang, Level } from "./types";

/* ───────────── Paleta ───────────── */
const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const C = {
  paper: hex("#eae8df"),
  ink: hex("#111111"),
  coal: hex("#161616"),
  ash: hex("#2a2a2a"),
  cream: hex("#fbfaf5"),
  white: hex("#ffffff"),
  sand: hex("#dad7ce"),
  violet: hex("#a78bfa"),
  lilac: hex("#c9b8ff"),
  lime: hex("#d4f04a"),
  mute: hex("#a3a3a3"),
  stone: hex("#5c5b55"),
  good: hex("#2fbf71"),
  warn: hex("#f5c518"),
  bad: hex("#ef4444"),
};
const LEVEL_COLOR: Record<Level, RGB> = { good: C.good, warn: C.warn, bad: C.bad, empty: C.sand, manual: C.violet };

/* ───────────── Textos ───────────── */
const TXT = {
  es: {
    kicker: "Reporte de accesibilidad web",
    analyzed: "Analizado",
    overall: "Puntaje general",
    outOf: "de 100",
    pass: "pasan",
    fail: "fallan",
    manual: "a revisar",
    verdict: { good: "Muy buena base. Queda pulir detalles.", warn: "Va bien, pero hay barreras importantes.", bad: "Hay varias barreras para muchas personas.", empty: "", manual: "" } as Record<Level, string>,
    howTo: "Cómo leer este reporte",
    howToBody:
      "Cada categoría agrupa chequeos automáticos de Lighthouse según los principios de la W3C. El termómetro muestra qué parte de los chequeos que aplican a la página pasan. El puntaje general usa el mismo criterio: 100 solo si pasan todos.",
    legend: [
      ["good", `Verde: pasa ${THRESHOLDS.good}% o más`],
      ["warn", `Amarillo: entre ${THRESHOLDS.warn}% y ${THRESHOLDS.good - 1}%`],
      ["bad", `Rojo: menos de ${THRESHOLDS.warn}%`],
    ] as [Level, string][],
    principles: "Los 4 principios",
    principlesBody: [
      ["Perceptible", "la información se puede ver, oír o leer de más de una forma."],
      ["Operable", "todo se puede usar con teclado, mouse, toque o voz."],
      ["Comprensible", "el contenido y la interfaz son claros y predecibles."],
      ["Robusto", "funciona con lectores de pantalla y otras tecnologías de apoyo."],
    ],
    summary: "Resumen por categoría",
    summarySub: "Chequeos que pasan sobre los que aplican, en cada dispositivo.",
    noItems: "No aplica",
    checks: "chequeos",
    details: "Detalle y cómo solucionarlo",
    found: "Qué encontramos",
    fix: "Cómo solucionarlo",
    resources: "Recursos",
    elements: (n: number) => (n === 1 ? "1 elemento" : `${n} elementos`),
    allGood: "Sin problemas automáticos en ninguna categoría. ¡Excelente! Igual hacé la revisión manual.",
    cleanList: "Sin problemas automáticos",
    manualTitle: "Revisión manual",
    manualBody:
      "Las pruebas automáticas detectan solo una parte de los problemas. Estos puntos requieren que una persona recorra el sitio.",
    howTest: "Cómo probarlo",
    credit: "Reporte generado con A11yze",
    page: "Página",
    device: { desktop: "Desktop", mobile: "Mobile" } as Record<Device, string>,
  },
  en: {
    kicker: "Web accessibility report",
    analyzed: "Analyzed",
    overall: "Overall score",
    outOf: "out of 100",
    pass: "pass",
    fail: "fail",
    manual: "to review",
    verdict: { good: "Solid foundation. Some details to polish.", warn: "Going well, but there are important barriers.", bad: "There are several barriers for many people.", empty: "", manual: "" } as Record<Level, string>,
    howTo: "How to read this report",
    howToBody:
      "Each category groups Lighthouse automated checks following the W3C principles. The thermometer shows how many of the checks that apply to the page pass. The overall score uses the same rule: 100 only if every check passes.",
    legend: [
      ["good", `Green: ${THRESHOLDS.good}% or more pass`],
      ["warn", `Yellow: between ${THRESHOLDS.warn}% and ${THRESHOLDS.good - 1}%`],
      ["bad", `Red: under ${THRESHOLDS.warn}%`],
    ] as [Level, string][],
    principles: "The 4 principles",
    principlesBody: [
      ["Perceivable", "information can be seen, heard or read in more than one way."],
      ["Operable", "everything works with keyboard, mouse, touch or voice."],
      ["Understandable", "content and interface are clear and predictable."],
      ["Robust", "it works with screen readers and other assistive tech."],
    ],
    summary: "Summary by category",
    summarySub: "Checks that pass out of those that apply, on each device.",
    noItems: "N/A",
    checks: "checks",
    details: "Details and how to fix",
    found: "What we found",
    fix: "How to fix it",
    resources: "Resources",
    elements: (n: number) => (n === 1 ? "1 element" : `${n} elements`),
    allGood: "No automated issues in any category. Excellent! Still do the manual review.",
    cleanList: "No automated issues",
    manualTitle: "Manual review",
    manualBody: "Automated tests catch only part of the issues. These points need a person to go through the site.",
    howTest: "How to test it",
    credit: "Report generated with A11yze",
    page: "Page",
    device: { desktop: "Desktop", mobile: "Mobile" } as Record<Device, string>,
  },
};

/* ───────────── Geometría ───────────── */
const W = 595.28;
const H = 841.89;
const M = 40; // margen
const CW = W - M * 2; // ancho de contenido
const FOOTER_Y = H - 30;
const BOTTOM = H - 58; // límite inferior del contenido

interface Ctx {
  doc: PDFDocument;
  reg: PDFFont;
  bold: PDFFont;
  mono: PDFFont;
  t: (typeof TXT)["es"];
  lang: Lang;
  page: PDFPage;
  y: number; // cursor desde arriba
}

/** pdf-lib con fuentes estándar usa WinAnsi: reemplazamos lo que no se puede codificar. */
function safe(font: PDFFont, input: string) {
  const s = String(input ?? "")
    .replace(/`/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/≈/g, "~")
    .replace(/[​-‍﻿]/g, "");
  let out = "";
  for (const ch of s) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      out += "?";
    }
  }
  return out;
}

function wrap(font: PDFFont, text: string, size: number, maxW: number) {
  const words = safe(font, text).split(" ").filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxW) line = test;
    else {
      if (line) lines.push(line);
      // palabra más larga que el ancho: la cortamos
      let word = w;
      while (font.widthOfTextAtSize(word, size) > maxW && word.length > 1) {
        let i = word.length;
        while (i > 1 && font.widthOfTextAtSize(word.slice(0, i), size) > maxW) i--;
        lines.push(word.slice(0, i));
        word = word.slice(i);
      }
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function ellipsize(font: PDFFont, text: string, size: number, maxW: number) {
  let s = safe(font, text);
  if (font.widthOfTextAtSize(s, size) <= maxW) return s;
  while (s.length > 1 && font.widthOfTextAtSize(`${s}...`, size) > maxW) s = s.slice(0, -1);
  return `${s}...`;
}

function text(p: PDFPage, font: PDFFont, s: string, x: number, yTop: number, size: number, color = C.ink, opacity = 1) {
  p.drawText(safe(font, s), { x, y: H - yTop, size, font, color, opacity });
}

function textRight(p: PDFPage, font: PDFFont, s: string, xRight: number, yTop: number, size: number, color = C.ink) {
  const str = safe(font, s);
  p.drawText(str, { x: xRight - font.widthOfTextAtSize(str, size), y: H - yTop, size, font, color });
}

function lines(p: PDFPage, font: PDFFont, ls: string[], x: number, yTop: number, size: number, lh: number, color = C.ink) {
  ls.forEach((l, i) => p.drawText(l, { x, y: H - (yTop + i * lh), size, font, color }));
  return ls.length * lh;
}

function rr(p: PDFPage, x: number, yTop: number, w: number, h: number, r: number, color: RGB, opacity = 1, border?: RGB) {
  r = Math.min(r, w / 2, h / 2);
  const path = `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  p.drawSvgPath(path, {
    x,
    y: H - yTop,
    color,
    opacity,
    ...(border ? { borderColor: border, borderWidth: 0.6, borderOpacity: 1 } : {}),
  });
}

function asterisk(p: PDFPage, cx: number, cyTop: number, radius: number, color: RGB, opacity = 1) {
  const thickness = radius * 0.36;
  for (const deg of [0, 45, 90, 135]) {
    const a = (deg * Math.PI) / 180;
    const dx = Math.sin(a) * (radius - thickness / 2);
    const dy = Math.cos(a) * (radius - thickness / 2);
    p.drawLine({
      start: { x: cx - dx, y: H - cyTop - dy },
      end: { x: cx + dx, y: H - cyTop + dy },
      thickness,
      color,
      opacity,
      lineCap: LineCapStyle.Round,
    });
  }
}

/** Mancha difusa (simula un degradé radial con círculos superpuestos). */
function blob(p: PDFPage, cx: number, cyTop: number, radius: number, color: RGB, strength = 0.5) {
  const steps = 14;
  for (let i = 0; i < steps; i++) {
    const r = radius * (1 - i / steps);
    p.drawCircle({ x: cx, y: H - cyTop, size: r, color, opacity: (strength / steps) * 1.6 });
  }
}

function thermometer(p: PDFPage, x: number, yTop: number, w: number, value: number, level: Level, track: RGB, big = false) {
  const tube = big ? 8 : 6;
  const bulb = big ? 7 : 5;
  const fill = LEVEL_COLOR[level];
  const v = Math.max(0, Math.min(100, value));
  // el tubo va de centro a centro del bulbo en 0 % y en 100 %
  const x0 = x + bulb;
  const span = w - bulb * 2;
  rr(p, x0 - tube / 2, yTop - tube / 2, span + tube, tube, tube / 2, track, 0.14);
  const end = x0 + (span * v) / 100;
  if (v > 0) rr(p, x0 - tube / 2, yTop - tube / 2, end - x0 + tube, tube, tube / 2, fill);
  for (const m of [THRESHOLDS.warn, THRESHOLDS.good]) {
    const mx = x0 + (span * m) / 100;
    p.drawLine({ start: { x: mx, y: H - yTop + tube / 2 }, end: { x: mx, y: H - yTop - tube / 2 }, thickness: 0.6, color: track, opacity: 0.35 });
  }
  // bulbo apoyado en el extremo del llenado
  p.drawCircle({ x: end, y: H - yTop, size: bulb + 1.8, color: track, opacity: 0.16 });
  p.drawCircle({ x: end, y: H - yTop, size: bulb, color: fill });
}

function pill(p: PDFPage, font: PDFFont, s: string, x: number, yTop: number, color: RGB, bg?: RGB, size = 7.5) {
  const str = safe(font, s);
  const w = font.widthOfTextAtSize(str, size) + 14;
  if (bg) rr(p, x, yTop, w, 16, 8, bg);
  else rr(p, x, yTop, w, 16, 8, color, 0.08);
  p.drawText(str, { x: x + 7, y: H - yTop - 11, size, font, color });
  return w;
}

function link(ctx: Ctx, url: string, x: number, yTop: number, w: number, h: number) {
  const { doc, page } = ctx;
  const annot = doc.context.register(
    doc.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x, H - yTop - h, x + w, H - yTop],
      Border: [0, 0, 0],
      A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
    }),
  );
  const annots = page.node.lookup(PDFName.of("Annots"));
  if (annots) (annots as unknown as { push: (r: unknown) => void }).push(annot);
  else page.node.set(PDFName.of("Annots"), doc.context.obj([annot]));
}

function newPage(ctx: Ctx, bg = C.paper) {
  ctx.page = ctx.doc.addPage([W, H]);
  ctx.page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: bg });
  ctx.y = M;
}

function ensure(ctx: Ctx, h: number) {
  if (ctx.y + h > BOTTOM) newPage(ctx);
}

function logo(ctx: Ctx, x: number, yTop: number) {
  const { page, bold } = ctx;
  rr(page, x, yTop, 26, 26, 8, C.lime);
  asterisk(page, x + 13, yTop + 13, 8, C.ink);
  text(page, bold, "A11yze", x + 34, yTop + 18, 15);
}

/* ───────────── Secciones ───────────── */

function cover(ctx: Ctx, a: Analysis) {
  const { t, reg, bold } = ctx;
  newPage(ctx, C.cream);
  const p = ctx.page;
  blob(p, 40, 30, 330, C.lime, 0.9);
  blob(p, W + 20, 330, 260, C.lilac, 0.75);
  asterisk(p, W - 70, 150, 80, C.ink, 0.05);

  logo(ctx, M, M);
  const date = new Date(a.analyzedAt).toLocaleString(ctx.lang === "es" ? "es-AR" : "en-US", { dateStyle: "long", timeStyle: "short" });
  textRight(p, reg, `${t.analyzed} ${date}`, W - M, M + 17, 8.5, C.stone);

  let y = 150;
  pill(p, bold, t.kicker.toUpperCase(), M, y, C.ink, undefined, 7.5);
  y += 40;
  const host = new URL(a.mobile.finalUrl || a.url).host.replace(/^www\./, "");
  const titleSize = host.length > 22 ? 34 : 46;
  const ls = wrap(bold, host, titleSize, CW);
  y += titleSize * 0.8;
  y += lines(p, bold, ls, M, y, titleSize, titleSize * 1.02);
  text(p, reg, ellipsize(reg, a.mobile.finalUrl || a.url, 10, CW), M, y + 10, 10, C.stone);
  y += 40;

  // Tarjetas de puntaje
  const cardW = (CW - 12) / 2;
  const cardH = 210;
  (["desktop", "mobile"] as Device[]).forEach((d, i) => {
    const r = a[d];
    const x = M + i * (cardW + 12);
    const own = overallScore(r);
    const score = own ?? 0;
    const level = levelFor(own);
    rr(p, x, y, cardW, cardH, 22, C.coal);
    pill(p, bold, t.device[d], x + 18, y + 18, C.cream, C.ash);
    text(p, reg, t.overall, x + cardW - 18 - reg.widthOfTextAtSize(t.overall, 8), y + 30, 8, C.mute);
    text(p, bold, String(score), x + 18, y + 104, 64, C.cream);
    text(p, reg, t.outOf, x + 22 + bold.widthOfTextAtSize(String(score), 64), y + 104, 9, C.mute);
    thermometer(p, x + 18, y + 124, cardW - 36, score, level, C.cream, true);
    lines(p, reg, wrap(reg, t.verdict[level], 9.5, cardW - 36), x + 18, y + 148, 9.5, 12, C.cream);

    const counts = { fail: 0, pass: 0, manual: 0, na: 0 };
    r.audits.forEach((au) => counts[au.status]++);
    const boxes: [keyof typeof counts, string, RGB][] = [
      ["fail", t.fail, C.bad],
      ["pass", t.pass, C.good],
      ["manual", t.manual, C.violet],
    ];
    const bw = (cardW - 36 - 12) / 3;
    boxes.forEach(([k, label, col], j) => {
      const bx = x + 18 + j * (bw + 6);
      rr(p, bx, y + 166, bw, 32, 10, C.ash);
      p.drawCircle({ x: bx + 10, y: H - (y + 177), size: 2.5, color: col });
      text(p, reg, label, bx + 16, y + 179.5, 7, C.mute);
      text(p, bold, String(counts[k]), bx + 9, y + 193, 10.5, C.cream);
    });
  });
  y += cardH + 14;

  // Cómo leer + principios
  const colW = (CW - 12) / 2;
  const boxH = 196;
  rr(p, M, y, colW, boxH, 22, C.white, 0.75);
  text(p, bold, t.howTo, M + 18, y + 30, 13);
  let yy = y + 44 + lines(p, reg, wrap(reg, t.howToBody, 8.5, colW - 36), M + 18, y + 48, 8.5, 11.5, C.stone);
  yy += 10;
  t.legend.forEach(([lv, label]) => {
    const value = lv === "good" ? 90 : lv === "warn" ? 55 : 22;
    thermometer(p, M + 18, yy + 4, 60, value, lv, C.ink);
    text(p, reg, label, M + 88, yy + 7, 8.5);
    yy += 20;
  });

  const px = M + colW + 12;
  rr(p, px, y, colW, boxH, 22, C.violet);
  text(p, bold, t.principles, px + 18, y + 30, 13);
  let py = y + 50;
  t.principlesBody.forEach(([name, body]) => {
    text(p, bold, name, px + 18, py, 9);
    py += 4 + lines(p, reg, wrap(reg, body, 8.5, colW - 36), px + 18, py + 12, 8.5, 11);
    py += 8;
  });
  ctx.y = y + boxH;
}

function summary(ctx: Ctx, a: Analysis) {
  const { t, reg, bold, lang } = ctx;
  newPage(ctx);
  const p = ctx.page;
  logo(ctx, M, M);
  ctx.y = M + 64;
  text(p, bold, t.summary, M, ctx.y, 26);
  text(p, reg, t.summarySub, M, ctx.y + 22, 9, C.stone);
  ctx.y += 48;

  // encabezados de columnas
  const colX = { name: M + 18, d: M + 250, m: M + 250 + 132 };
  text(p, bold, t.device.desktop.toUpperCase(), colX.d, ctx.y + 4, 7, C.stone);
  text(p, bold, t.device.mobile.toUpperCase(), colX.m, ctx.y + 4, 7, C.stone);
  ctx.y += 14;

  const rowH = 54;
  for (const c of CATEGORIES) {
    const sd = statsFor(auditsFor(a.desktop, c), c);
    const sm = statsFor(auditsFor(a.mobile, c), c);
    const isManual = c.id === "manual";
    const worst: Level = [sd.level, sm.level].includes("bad") ? "bad" : [sd.level, sm.level].includes("warn") ? "warn" : sd.level;
    // nivel bajo → negro · revisión manual → violeta · resto → blanco
    const dark = !isManual && worst === "bad";
    const bg = isManual ? C.violet : dark ? C.coal : C.white;
    const fg = dark ? C.cream : C.ink;
    const sub = dark ? C.mute : isManual ? C.ink : C.stone;
    const track = dark ? C.cream : C.ink;
    rr(p, M, ctx.y, CW, rowH - 8, 18, bg, isManual || dark ? 1 : 0.8);
    text(p, bold, `${CATEGORIES.indexOf(c) + 1}. ${c.title[lang]}`, colX.name, ctx.y + 20, 11, fg);
    text(p, reg, PRINCIPLES[c.principle][lang] + (c.wcag.length ? `  ·  WCAG ${c.wcag.join(", ")}` : ""), colX.name, ctx.y + 34, 7.5, sub);

    ([[sd, colX.d], [sm, colX.m]] as [CategoryStats, number][]).forEach(([s, x]) => {
      if (isManual) {
        text(p, bold, `${s.manual}`, x, ctx.y + 28, 14, C.ink);
        text(p, reg, t.checks, x + bold.widthOfTextAtSize(`${s.manual}`, 14) + 4, ctx.y + 28, 8, C.ink);
      } else if (s.score === null) {
        text(p, reg, t.noItems, x, ctx.y + 27, 9, sub);
      } else {
        thermometer(p, x, ctx.y + 24, 80, s.score, s.level, track);
        text(p, bold, `${s.pass}/${s.total}`, x + 88, ctx.y + 27, 9, fg);
      }
    });
    ctx.y += rowH;
  }
}

interface Issue {
  audit: AuditResult;
  devices: Device[];
}

function issuesFor(a: Analysis, c: Category): Issue[] {
  const map = new Map<string, Issue>();
  (["desktop", "mobile"] as Device[]).forEach((d) => {
    auditsFor(a[d], c)
      .filter((au) => au.status === "fail")
      .forEach((au) => {
        const prev = map.get(au.id);
        if (prev) prev.devices.push(d);
        else map.set(au.id, { audit: au, devices: [d] });
      });
  });
  return [...map.values()];
}

function categoryBlock(ctx: Ctx, a: Analysis, c: Category, issues: Issue[]) {
  const { t, reg, bold, mono, lang } = ctx;
  const pad = 24;
  const inner = CW - pad * 2;
  const leftW = inner * 0.57;
  const gap = 20;
  const rightW = inner - leftW - gap;
  const shown = issues.slice(0, 3);

  /* ── medir ── */
  const titleLines = wrap(bold, `${CATEGORIES.indexOf(c) + 1}. ${c.title[lang]}`, 18, inner - 150);
  const headerH = Math.max(16 + 16 + titleLines.length * 22, 56);
  const issueLay = shown.map((is) => {
    const tl = wrap(bold, is.audit.title, 8.5, leftW - 12);
    const snippet = is.audit.items[0]?.snippet;
    return { tl, snippet, h: tl.length * 11.5 + 19 + (snippet ? 16 : 0) + 12 };
  });
  const leftH = 18 + issueLay.reduce((acc, l) => acc + l.h, 0) + (issues.length > shown.length ? 12 : 0);
  const strat = c.strategies[lang].map((s) => wrap(reg, s, 8, rightW - 18));
  const res = c.resources.map((r) => wrap(bold, r.label[lang], 8, rightW - 10));
  const rightH = 18 + strat.reduce((acc, l) => acc + l.length * 11 + 8, 0) + 18 + 14 + res.reduce((acc, l) => acc + l.length * 11 + 6, 0);
  const height = pad + headerH + 22 + Math.max(leftH, rightH) + pad;

  ensure(ctx, height + 16);
  const p = ctx.page;
  const x0 = M;
  const yTop = ctx.y;
  rr(p, x0, yTop, CW, height, 24, C.white, 0.85);

  /* ── encabezado ── */
  let y = yTop + pad;
  let px = x0 + pad;
  px += pill(p, bold, PRINCIPLES[c.principle][lang], px, y, C.ink) + 4;
  c.wcag.forEach((w) => (px += pill(p, reg, `WCAG ${w}`, px, y, C.ink) + 4));
  lines(p, bold, titleLines, x0 + pad, y + 16 + 16 + 14, 18, 22);

  (["desktop", "mobile"] as Device[]).forEach((d, i) => {
    const s = statsFor(auditsFor(a[d], c), c);
    const bx = x0 + CW - pad - 130;
    const by = y + 2 + i * 22;
    rr(p, bx - 8, by - 2, 138, 18, 9, C.paper);
    text(p, bold, t.device[d], bx, by + 10, 7, C.stone);
    if (s.score !== null) {
      thermometer(p, bx + 40, by + 7, 54, s.score, s.level, C.ink);
      textRight(p, bold, `${s.pass}/${s.total}`, bx + 124, by + 10, 7.5);
    } else textRight(p, reg, t.noItems, bx + 124, by + 10, 7.5, C.stone);
  });

  const colTop = y + headerH + 22;
  // separador vertical
  p.drawLine({ start: { x: x0 + pad + leftW + gap / 2, y: H - colTop + 4 }, end: { x: x0 + pad + leftW + gap / 2, y: H - (yTop + height - pad) }, thickness: 0.5, color: C.ink, opacity: 0.1 });

  /* ── izquierda: qué encontramos ── */
  let ly = colTop;
  text(p, bold, t.found.toUpperCase(), x0 + pad, ly, 7, C.stone);
  ly += 12;
  shown.forEach((is, i) => {
    const lay = issueLay[i];
    const lx = x0 + pad;
    p.drawCircle({ x: lx + 3, y: H - (ly + 6), size: 2.6, color: C.bad });
    lines(p, bold, lay.tl, lx + 12, ly + 9, 8.5, 11.5);
    let cy = ly + lay.tl.length * 11.5 + 4;
    let cx = lx + 12;
    const chips: [string, RGB][] = [[is.devices.map((d) => t.device[d]).join(" + "), C.sand]];
    if (is.audit.total) chips.push([t.elements(is.audit.total), C.violet]);
    chips.forEach(([chip, bg]) => {
      const w = reg.widthOfTextAtSize(safe(reg, chip), 6.5) + 12;
      rr(p, cx, cy, w, 13, 6.5, bg);
      text(p, reg, chip, cx + 6, cy + 9.2, 6.5);
      cx += w + 4;
    });
    cy += 18;
    if (lay.snippet) {
      rr(p, lx + 12, cy, leftW - 12, 12, 4, C.coal);
      text(p, mono, ellipsize(mono, lay.snippet, 6.3, leftW - 26), lx + 18, cy + 8.3, 6.3, C.sand);
    }
    ly += lay.h;
  });
  if (issues.length > shown.length) text(p, reg, `+ ${issues.length - shown.length}`, x0 + pad + 12, ly + 6, 8, C.stone);

  /* ── derecha: cómo solucionarlo + recursos ── */
  const rx = x0 + pad + leftW + gap;
  let ry = colTop;
  text(p, bold, t.fix.toUpperCase(), rx, ry, 7, C.stone);
  ry += 12;
  strat.forEach((ls, i) => {
    p.drawCircle({ x: rx + 5.5, y: H - (ry + 6), size: 5.5, color: C.ink });
    const n = String(i + 1);
    text(p, bold, n, rx + 5.5 - bold.widthOfTextAtSize(n, 6.5) / 2, ry + 8.3, 6.5, C.cream);
    lines(p, reg, ls, rx + 16, ry + 9, 8, 11);
    ry += ls.length * 11 + 8;
  });
  ry += 18;
  text(p, bold, t.resources.toUpperCase(), rx, ry, 7, C.stone);
  ry += 10;
  c.resources.forEach((r, i) => {
    const ls = res[i];
    const top = ry;
    p.drawCircle({ x: rx + 3, y: H - (top + 7.5), size: 2.4, color: C.violet });
    ls.forEach((l, j) => {
      const yy = top + 10 + j * 11;
      text(p, bold, l, rx + 10, yy, 8);
      const w = bold.widthOfTextAtSize(l, 8);
      p.drawLine({ start: { x: rx + 10, y: H - yy - 1.6 }, end: { x: rx + 10 + w, y: H - yy - 1.6 }, thickness: 0.5, color: C.violet });
    });
    link(ctx, r.href, rx, top + 1, rightW, ls.length * 11 + 2);
    ry += ls.length * 11 + 6;
  });

  ctx.y += height + 16;
}

function details(ctx: Ctx, a: Analysis) {
  const { t, reg, bold, lang } = ctx;
  newPage(ctx);
  logo(ctx, M, M);
  ctx.y = M + 64;
  text(ctx.page, bold, t.details, M, ctx.y, 26);
  ctx.y += 30;

  const withIssues = CATEGORIES.filter((c) => c.id !== "manual").map((c) => ({ c, issues: issuesFor(a, c) }));
  const bad = withIssues.filter((x) => x.issues.length);
  const clean = withIssues.filter((x) => !x.issues.length);

  if (!bad.length) {
    rr(ctx.page, M, ctx.y, CW, 50, 20, C.lime);
    lines(ctx.page, bold, wrap(bold, t.allGood, 10, CW - 40), M + 20, ctx.y + 22, 10, 13);
    ctx.y += 62;
  }
  bad.forEach(({ c, issues }) => categoryBlock(ctx, a, c, issues));

  if (clean.length) {
    const names = clean.map((x) => x.c.title[lang]).join("  ·  ");
    const ls = wrap(reg, names, 9, CW - 40);
    const h = 40 + ls.length * 12;
    ensure(ctx, h);
    rr(ctx.page, M, ctx.y, CW, h, 20, C.lime, 0.85);
    text(ctx.page, bold, t.cleanList, M + 20, ctx.y + 22, 10);
    lines(ctx.page, reg, ls, M + 20, ctx.y + 38, 9, 12);
    ctx.y += h + 12;
  }
}

function manualPage(ctx: Ctx, a: Analysis) {
  const { t, reg, bold, lang } = ctx;
  const c = CATEGORIES.find((x) => x.id === "manual")!;
  const audits = auditsFor(a.desktop, c);
  const items = audits.map((au) => wrap(reg, au.title, 8.5, (CW - 64) / 2 - 14));
  const strat = c.strategies[lang].map((s) => wrap(reg, s, 9, CW - 70));
  const body = wrap(reg, t.manualBody, 9.5, CW - 110);

  const half = Math.ceil(items.length / 2);
  const colH = (arr: string[][]) => arr.reduce((acc, l) => acc + l.length * 11 + 9, 0);
  const listH = Math.max(colH(items.slice(0, half)), colH(items.slice(half)));
  const stratH = strat.reduce((acc, l) => acc + l.length * 12 + 9, 0);
  const height = 28 + 26 + body.length * 13 + 20 + listH + 28 + 18 + stratH + 28;

  ensure(ctx, height + 80);
  const p = ctx.page;
  let y = ctx.y;
  rr(p, M, y, CW, height, 26, C.violet);
  asterisk(p, M + CW - 46, y + 44, 20, C.ink, 0.12);
  y += 28 + 18;
  text(p, bold, t.manualTitle, M + 24, y, 22, C.ink);
  y += 10;
  y += lines(p, reg, body, M + 24, y + 14, 9.5, 13, C.ink) + 20;

  const colW = (CW - 64) / 2;
  [items.slice(0, half), items.slice(half)].forEach((col, ci) => {
    let yy = y;
    col.forEach((ls) => {
      const x = M + 24 + ci * (colW + 16);
      rr(p, x, yy, 8, 8, 2.5, C.ink);
      lines(p, reg, ls, x + 14, yy + 7.5, 8.5, 11, C.ink);
      yy += ls.length * 11 + 9;
    });
  });
  y += listH + 28;
  text(p, bold, t.howTest.toUpperCase(), M + 24, y, 7.5, C.ink);
  y += 10;
  strat.forEach((ls, i) => {
    p.drawCircle({ x: M + 30, y: H - (y + 7), size: 6, color: C.ink });
    const n = String(i + 1);
    text(p, bold, n, M + 30 - bold.widthOfTextAtSize(n, 7) / 2, y + 9.5, 7, C.cream);
    lines(p, reg, ls, M + 42, y + 10, 9, 12, C.ink);
    y += ls.length * 12 + 9;
  });
  ctx.y += height + 14;

  // cierre con contacto
  const h = 56;
  ensure(ctx, h);
  rr(ctx.page, M, ctx.y, CW, h, 22, C.lime);
  asterisk(ctx.page, M + 30, ctx.y + h / 2, 12, C.ink);
  text(ctx.page, bold, t.credit, M + 52, ctx.y + 24, 11);
  text(ctx.page, reg, `${SITE.author}  ·  ${SITE.email}  ·  ${SITE.links.map((l) => l.handle).join("  ·  ")}`, M + 52, ctx.y + 39, 8.5, C.ink);
  link(ctx, `mailto:${SITE.email}`, M, ctx.y, CW, h);
  ctx.y += h;
}

function footers(ctx: Ctx, a: Analysis) {
  const pages = ctx.doc.getPages();
  const host = new URL(a.mobile.finalUrl || a.url).host;
  pages.forEach((p, i) => {
    const color = i === 0 ? C.stone : C.stone;
    p.drawLine({ start: { x: M, y: H - (FOOTER_Y - 12) }, end: { x: W - M, y: H - (FOOTER_Y - 12) }, thickness: 0.5, color: C.ink, opacity: 0.12 });
    text(p, ctx.reg, `A11yze  ·  ${host}`, M, FOOTER_Y, 7.5, color);
    const right = `${ctx.t.page} ${i + 1} / ${pages.length}`;
    textRight(p, ctx.reg, right, W - M, FOOTER_Y, 7.5, color);
  });
}

/* ───────────── API ───────────── */

export async function buildReportPdf(a: Analysis, lang: Lang): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const host = new URL(a.mobile.finalUrl || a.url).host;
  doc.setTitle(`A11yze — ${host}`);
  doc.setAuthor(SITE.author);
  doc.setCreator("A11yze");
  doc.setSubject(TXT[lang].kicker);
  doc.setLanguage(lang === "es" ? "es-AR" : "en-US");

  const ctx: Ctx = {
    doc,
    reg: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    mono: await doc.embedFont(StandardFonts.Courier),
    t: TXT[lang],
    lang,
    page: undefined as unknown as PDFPage,
    y: 0,
  };

  cover(ctx, a);
  summary(ctx, a);
  details(ctx, a);
  manualPage(ctx, a);
  footers(ctx, a);
  return doc.save();
}

export function reportFileName(a: Analysis) {
  const host = new URL(a.mobile.finalUrl || a.url).host.replace(/^www\./, "").replace(/[^a-z0-9.-]/gi, "-");
  const date = a.analyzedAt.slice(0, 10);
  return `a11yze-${host}-${date}.pdf`;
}
