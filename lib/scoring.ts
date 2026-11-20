import { CATEGORIES, type Category } from "./categories";
import type { AuditResult, CategoryId, DeviceReport, Level } from "./types";

const auditToCategory = new Map<string, CategoryId>();
const groupToCategory = new Map<string, CategoryId>();
for (const c of CATEGORIES) {
  c.audits.forEach((a) => auditToCategory.set(a, c.id));
  c.groups.forEach((g) => groupToCategory.set(g, c.id));
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
  /** 0–100, null si no hubo nada aplicable */
  score: number | null;
  level: Level;
}

export function statsFor(audits: AuditResult[], category: Category): CategoryStats {
  const count = (s: AuditResult["status"]) => audits.filter((a) => a.status === s).length;
  const pass = count("pass");
  const fail = count("fail");
  const manual = count("manual");
  const na = count("na");

  const scored = audits.filter((a) => a.status === "pass" || a.status === "fail");
  const totalW = scored.reduce((s, a) => s + (a.weight || 1), 0);
  const passW = scored.filter((a) => a.status === "pass").reduce((s, a) => s + (a.weight || 1), 0);
  const score = scored.length ? Math.round((passW / totalW) * 100) : null;

  let level: Level;
  if (category.id === "manual") level = "manual";
  else if (score === null) level = "empty";
  else if (fail === 0) level = "good";
  else if (score >= 75) level = "warn";
  else level = "bad";

  return { pass, fail, manual, na, score, level };
}
