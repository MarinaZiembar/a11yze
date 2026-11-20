"use client";

import { Dashboard } from "@/components/Dashboard";
import { Hero } from "@/components/Hero";
import { useAnalysis } from "@/lib/store";

export default function Home() {
  const { analysis } = useAnalysis();
  return analysis ? (
    <div key="dash" className="animate-rise">
      <Dashboard />
    </div>
  ) : (
    <Hero />
  );
}
