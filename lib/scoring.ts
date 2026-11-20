import { CATEGORIES, type Category } from "./categories";
import type { AuditResult, CategoryId, DeviceReport, Level } from "./types";

const auditToCategory = new Map<string, CategoryId>();
const groupToCategory = new Map<string, CategoryId>();
for (const c of CATEGORIES) {
  c.audits.forEach((a) => auditToCategory.set(a, c.id));
  c.groups.forEach((g) => groupToCategory.set(g, c.id));
}

/**
 * Umbrales del termómetro (porcentaje de chequeos que pasan):
 *  ≥ 75 %  → verde    (pasa la mayoría)
 *  40–74 % → amarillo (más o menos la mitad)
 *  < 40 %  → rojo     (pasan pocos)
 * Se usan igual para cada categoría y para el puntaje general.
 */
export const THRESHOLDS = { good: 75, warn: 40 } as const;

export function levelFor(score: number | null): Level {
  if (score === null) return "empty";
  if (score >= THRESHOLDS.good) return "good";
  if (score >= THRESHOLDS.warn) return "warn";
  return "bad";
}

/** Cuántos chequeos tienen que pasar (de un total) para cada color. */
export function neededFor(total: number) {
  return {
    good: Math.ceil((total * THRESHOLDS.good) / 100),
    warn: Math.ceil((total * THRESHOLDS.warn) / 100),
  };
}

export function resolveCategory(audit: AuditResult): CategoryId {
  if (audit.status === "manual") return "manual";
  return auditToCategory.get(audit.id) ?? (audit.group ? groupToCategory.get(audit.group) : undefined) ?? "aria";
}

export function auditsFor(report: DeviceReport, category: Category): AuditResult[] {
  return report.audits.filter((a) => resolveCategory(a) === category.id);
}

export interface CategoryStats {
  pass: number;
  fail: number;
  manual: number;
  na: number;
  /** pass + fail: chequeos que aplicaron */
  total: number;
  /** 0–100 = pasan / aplicables. null si no aplicó nada */
  score: number | null;
  level: Level;
}

export function statsFor(audits: AuditResult[], category: Category): CategoryStats {
  const count = (s: AuditResult["status"]) => audits.filter((a) => a.status === s).length;
  const pass = count("pass");
  const fail = count("fail");
  const manual = count("manual");
  const na = count("na");
  const total = pass + fail;
  const score = total ? Math.round((pass / total) * 100) : null;
  const level: Level = category.id === "manual" ? "manual" : levelFor(score);
  return { pass, fail, manual, na, total, score, level };
}
