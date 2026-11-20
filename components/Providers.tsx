"use client";

import { LangProvider } from "@/lib/i18n";
import { AnalysisProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <AnalysisProvider>{children}</AnalysisProvider>
    </LangProvider>
  );
}
