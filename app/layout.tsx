import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SkipLink } from "@/components/SkipLink";
import "./globals.css";

const inter = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });

export const metadata: Metadata = {
  title: "A11yze — Análisis de accesibilidad web",
  description:
    "Analizá la accesibilidad de cualquier sitio en mobile y desktop, según los fundamentos de la W3C. Web accessibility analysis.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#eae8df" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-dvh font-sans">
        <Providers>
          <SkipLink />
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
