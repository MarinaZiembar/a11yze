import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SkipLink } from "@/components/SkipLink";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });

const TITLE = "A11yze — Análisis de accesibilidad web";
const DESCRIPTION =
  "Analizá la accesibilidad de cualquier sitio en mobile y desktop, según los fundamentos de la W3C. Web accessibility analysis.";

export const metadata: Metadata = {
  metadataBase: new URL("https://a11yze.vercel.app"),
  title: TITLE,
  description: DESCRIPTION,
  icons: { icon: "/icon.svg" },
  // La imagen la genera app/opengraph-image.tsx; Next la agrega sola a og:image y twitter:image
  openGraph: {
    type: "website",
    url: "/",
    siteName: "A11yze",
    title: TITLE,
    description: DESCRIPTION,
    locale: "es_AR",
    alternateLocale: ["en_US"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#eae8df" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={bricolage.variable}>
      <body className="min-h-dvh font-sans">
        <Providers>
          <SkipLink />
          <Header />
          {children}
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
