import type { AuditItem, AuditResult, AuditStatus, Device, DeviceReport, ErrorCode, Lang } from "./types";

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export class PsiError extends Error {
  constructor(public code: ErrorCode, message?: string) {
    super(message ?? code);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const MD_LINK = /\[([^\]]+)\]\((https?:[^)]+)\)/;

function firstLink(md = "") {
  return md.match(MD_LINK)?.[2];
}

/** Lighthouse termina las descripciones con "[Más información](url)." — lo sacamos. */
function cleanDescription(md = "") {
  return md
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)\.?/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const clip = (s: string | undefined, n: number) =>
  !s ? undefined : s.length > n ? `${s.slice(0, n - 1)}…` : s;

function toStatus(audit: any): AuditStatus {
  switch (audit?.scoreDisplayMode) {
    case "manual":
      return "manual";
    case "binary":
    case "numeric":
    case "metricSavings":
      if (typeof audit.score !== "number") return "na";
      return audit.score >= 0.9 ? "pass" : "fail";
    default:
      return "na"; // notApplicable, informative, error
  }
}

function toItems(details: any): { items: AuditItem[]; total: number } {
  const raw: any[] = Array.isArray(details?.items) ? details.items : [];
  const nodes = raw.map((it) => it?.node ?? it).filter((n) => n && (n.snippet || n.selector));
  return {
    total: nodes.length,
    items: nodes.slice(0, 6).map((n) => ({
      snippet: clip(n.snippet, 180),
      selector: clip(n.selector, 120),
      label: clip(n.nodeLabel, 80),
      explanation: clip(String(n.explanation ?? "").split("\n").slice(0, 3).join(" ").replace(/\s+/g, " ").trim() || undefined, 260),
    })),
  };
}

export function parseLighthouse(data: any, fallbackUrl: string): DeviceReport {
  const lh = data?.lighthouseResult;
  if (!lh) throw new PsiError("generic", "Missing lighthouseResult");
  if (lh.runtimeError?.code && lh.runtimeError.code !== "NO_ERROR") {
    throw new PsiError("unreachable", lh.runtimeError.message);
  }
  const cat = lh.categories?.accessibility;
  if (!cat) throw new PsiError("generic", "Missing accessibility category");

  const audits: AuditResult[] = (cat.auditRefs as any[])
    .map((ref) => {
      const a = lh.audits?.[ref.id];
      if (!a) return null;
      const { items, total } = toItems(a.details);
      return {
        id: ref.id,
        title: a.title ?? ref.id,
        description: cleanDescription(a.description),
        docsUrl: firstLink(a.description),
        group: ref.group,
        status: toStatus(a),
        weight: typeof ref.weight === "number" ? ref.weight : 0,
        items,
        total,
      } satisfies AuditResult;
    })
    .filter(Boolean) as AuditResult[];

  return {
    score: typeof cat.score === "number" ? Math.round(cat.score * 100) : null,
    finalUrl: lh.finalDisplayedUrl ?? lh.finalUrl ?? fallbackUrl,
    audits,
  };
}

export async function runPsi(url: string, strategy: Device, locale: Lang): Promise<DeviceReport> {
  const params = new URLSearchParams({ url, strategy, category: "ACCESSIBILITY", locale });
  if (process.env.PSI_API_KEY) params.set("key", process.env.PSI_API_KEY);

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(55_000),
    });
  } catch {
    throw new PsiError("generic", "PSI request failed or timed out");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg: string = body?.error?.message ?? "";
    if (res.status === 429 || /quota/i.test(msg)) throw new PsiError("quota", msg);
    if (/FAILED_DOCUMENT_REQUEST|ERRORED_DOCUMENT_REQUEST|DNS_FAILURE|NO_FCP|NOT_HTML|unable to resolve|Lighthouse returned error/i.test(msg) || res.status === 400) {
      throw new PsiError("unreachable", msg);
    }
    throw new PsiError("generic", msg);
  }

  return parseLighthouse(await res.json(), url);
}

export { normalizeUrl } from "./url";
