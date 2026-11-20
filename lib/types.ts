export type Device = "mobile" | "desktop";
export type Lang = "es" | "en";
export type AuditStatus = "pass" | "fail" | "manual" | "na";
export type ErrorCode = "invalid" | "quota" | "unreachable" | "generic";

export interface AuditItem {
  snippet?: string;
  selector?: string;
  label?: string;
  explanation?: string;
}

export interface AuditResult {
  id: string;
  title: string;
  description: string;
  docsUrl?: string;
  group?: string;
  status: AuditStatus;
  weight: number;
  items: AuditItem[];
  total: number;
}

export interface DeviceReport {
  score: number | null;
  finalUrl: string;
  audits: AuditResult[];
}

export interface Analysis {
  url: string;
  analyzedAt: string;
  locale: Lang;
  mobile: DeviceReport;
  desktop: DeviceReport;
}

export type Principle = "perceivable" | "operable" | "understandable" | "robust" | "all";

export type CategoryId =
  | "images"
  | "contrast"
  | "structure"
  | "keyboard"
  | "names"
  | "forms"
  | "language"
  | "aria"
  | "touch"
  | "manual";

export type Level = "good" | "warn" | "bad" | "empty" | "manual";
