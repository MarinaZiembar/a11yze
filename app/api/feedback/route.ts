import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Envía el mensajito de la modal con Resend (API REST, sin SDK).
 * Variables de entorno:
 *  RESEND_API_KEY   (obligatoria) clave de https://resend.com/api-keys
 *  FEEDBACK_TO      (opcional) a quién llega; por defecto holaasoymaru@gmail.com
 *  FEEDBACK_FROM    (opcional) remitente de un dominio verificado en Resend;
 *                   por defecto onboarding@resend.dev (solo envía al mail de tu cuenta de Resend)
 */
const TO = process.env.FEEDBACK_TO || "holaasoymaru@gmail.com";
const FROM = process.env.FEEDBACK_FROM || "A11yze <onboarding@resend.dev>";

// Límite simple por IP (en memoria de la instancia): 5 mensajes cada 10 minutos.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim().slice(0, 80);
  const email = String(body?.email ?? "").trim().slice(0, 120);
  const message = String(body?.message ?? "").trim().slice(0, 2000);
  const lang = body?.lang === "en" ? "en" : "es";

  // Honeypot: los bots completan el campo oculto "website"
  if (body?.website) return NextResponse.json({ ok: true });
  if (message.length < 2) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (email && !EMAIL.test(email)) return NextResponse.json({ error: "email" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "rate" }, { status: 429 });

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[a11yze] RESEND_API_KEY no está configurada");
    return NextResponse.json({ error: "config" }, { status: 500 });
  }

  const html = `
  <div style="font-family:system-ui,sans-serif;background:#eae8df;padding:24px">
    <div style="max-width:520px;margin:auto;background:#fbfaf5;border-radius:24px;padding:28px">
      <p style="margin:0 0 4px;font-size:12px;color:#5c5b55">Nuevo mensajito desde A11yze (${lang.toUpperCase()})</p>
      <h1 style="margin:0 0 16px;font-size:24px;color:#111">${esc(name || "Anónimo")}</h1>
      <p style="white-space:pre-wrap;font-size:16px;line-height:1.5;color:#111;margin:0 0 20px">${esc(message)}</p>
      ${email ? `<p style="margin:0;font-size:13px;color:#5c5b55">Responder a: <a href="mailto:${esc(email)}" style="color:#111">${esc(email)}</a></p>` : ""}
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `A11yze ✦ mensajito${name ? ` de ${name}` : ""}`,
        html,
        text: `${name || "Anónimo"}${email ? ` <${email}>` : ""}\n\n${message}`,
        ...(email ? { reply_to: email } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[a11yze] resend error", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: "send" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[a11yze] resend failed", err);
    return NextResponse.json({ error: "send" }, { status: 502 });
  }
}
