import { ImageResponse } from "next/og";

/**
 * Imagen Open Graph (1200×630) con la estética del sitio: papel claro, degradé lima + violeta,
 * tarjeta negra de puntaje con termómetro, asterisco y Bricolage Grotesque.
 * Se genera una vez en el build (estática). Next agrega solo las meta og:image / twitter:image.
 */
export const alt = "A11yze — ¿Qué tan accesible es tu web? Análisis de accesibilidad en mobile y desktop";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = {
  ink: "#111111",
  coal: "#161616",
  ash: "#2a2a2a",
  cream: "#fbfaf5",
  lime: "#d4f04a",
  lilac: "#c9b8ff",
  violet: "#a78bfa",
  stone: "#5c5b55",
  mute: "#a3a3a3",
  good: "#2fbf71",
};

const TITLE = "¿Qué tan accesible es tu web?";
const TEXT_CHARS = `${TITLE}A11yzeAnálisis de accesibilidad web · mobile y desktop W3C WAI Puntaje general de 100 Perceptible Operable Comprensible Robusto 0123456789a11yze.vercel.app`;

/** Baja Bricolage Grotesque (solo los caracteres usados) desde Google Fonts en el build. */
async function loadFont(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@${weight}&text=${encodeURIComponent(TEXT_CHARS)}`,
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null; // si falla, ImageResponse usa su fuente por defecto y el build no se rompe
  }
}

function Asterisk({ size, color, opacity = 1 }: { size: number; color: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40" style={{ opacity }}>
      {[0, 45, 90, 135].map((r) => (
        <rect key={r} x="-3.2" y="-18" width="6.4" height="36" rx="3.2" fill={color} transform={`rotate(${r})`} />
      ))}
    </svg>
  );
}

export default async function OpengraphImage() {
  const [medium, semibold] = await Promise.all([loadFont(500), loadFont(600)]);
  const fonts = [
    ...(medium ? [{ name: "Bricolage", data: medium, weight: 500 as const, style: "normal" as const }] : []),
    ...(semibold ? [{ name: "Bricolage", data: semibold, weight: 600 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 28,
          background: "#eae8df",
          fontFamily: fonts.length ? "Bricolage" : undefined,
          color: C.ink,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            borderRadius: 48,
            overflow: "hidden",
            padding: "52px 56px",
            backgroundColor: C.cream,
            backgroundImage: `radial-gradient(circle at 6% 0%, ${C.lime} 0%, rgba(212,240,74,0) 55%), radial-gradient(circle at 100% 60%, ${C.lilac} 0%, rgba(201,184,255,0) 45%)`,
          }}
        >
          {/* asterisco decorativo */}
          <div style={{ position: "absolute", right: -90, top: -70, display: "flex" }}>
            <Asterisk size={360} color={C.ink} opacity={0.07} />
          </div>

          {/* columna izquierda */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 620 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 20, background: C.lime }}>
                <Asterisk size={36} color={C.ink} />
              </div>
              <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: -1.5 }}>A11yze</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignSelf: "flex-start", padding: "6px 16px", borderRadius: 999, border: `1.5px solid rgba(17,17,17,0.25)`, fontSize: 20, fontWeight: 500 }}>
                Análisis de accesibilidad web · mobile y desktop
              </div>
              <div style={{ marginTop: 22, fontSize: 78, fontWeight: 500, lineHeight: 0.98, letterSpacing: -3.5 }}>{TITLE}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: C.stone }}>
              <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: C.ink, color: C.cream, fontWeight: 500 }}>a11yze.vercel.app</div>
              <div style={{ display: "flex" }}>W3C WAI</div>
            </div>
          </div>

          {/* tarjeta de puntaje */}
          <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 380,
                padding: 32,
                borderRadius: 40,
                background: C.coal,
                color: C.cream,
                boxShadow: "0 30px 60px -30px rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ fontSize: 20, color: C.mute }}>Puntaje general</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 6 }}>
                <div style={{ fontSize: 150, fontWeight: 500, lineHeight: 0.9, letterSpacing: -8 }}>96</div>
                <div style={{ fontSize: 22, color: C.mute, marginBottom: 12 }}>de 100</div>
              </div>

              {/* termómetro con el bulbo en el extremo */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", height: 30, marginTop: 22 }}>
                <div style={{ display: "flex", width: "100%", height: 14, borderRadius: 999, background: "rgba(251,250,245,0.12)" }}>
                  <div style={{ display: "flex", width: "96%", height: 14, borderRadius: 999, background: C.good }} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 288, // 96 % de 316 px (ancho del tubo) − radio del bulbo
                    display: "flex",
                    width: 30,
                    height: 30,
                    borderRadius: 999,
                    background: C.good,
                    border: "4px solid rgba(251,250,245,0.18)",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 26 }}>
                {["Perceptible", "Operable", "Comprensible", "Robusto"].map((p, i) => (
                  <div
                    key={p}
                    style={{
                      display: "flex",
                      padding: "6px 14px",
                      borderRadius: 999,
                      fontSize: 18,
                      fontWeight: 500,
                      background: i === 3 ? C.violet : C.ash,
                      color: i === 3 ? C.ink : C.cream,
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
