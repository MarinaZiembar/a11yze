import { NextResponse } from "next/server";
import { normalizeUrl, PsiError, runPsi } from "@/lib/psi";
import type { Analysis, ErrorCode, Lang } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const STATUS: Record<ErrorCode, number> = { invalid: 400, quota: 429, unreachable: 422, generic: 502 };

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const url = normalizeUrl(body?.url);
  const locale: Lang = body?.locale === "en" ? "en" : "es";

  if (!url) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    // Mobile y desktop en paralelo: cada uno es una corrida completa de Lighthouse.
    const [mobile, desktop] = await Promise.all([
      runPsi(url, "mobile", locale),
      runPsi(url, "desktop", locale),
    ]);
    const analysis: Analysis = { url, analyzedAt: new Date().toISOString(), locale, mobile, desktop };
    return NextResponse.json(analysis);
  } catch (err) {
    const code: ErrorCode = err instanceof PsiError ? err.code : "generic";
    console.error("[a11yze] analyze failed:", code, err instanceof Error ? err.message : err);
    return NextResponse.json({ error: code }, { status: STATUS[code] });
  }
}
