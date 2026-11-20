"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Analysis, Device, ErrorCode, Lang } from "./types";

interface StoreCtx {
  analysis: Analysis | null;
  /** true cuando ya leímos sessionStorage (evita parpadeos en las páginas de detalle) */
  ready: boolean;
  loading: boolean;
  error: ErrorCode | null;
  device: Device;
  setDevice: (d: Device) => void;
  analyze: (url: string, locale: Lang) => Promise<void>;
  reset: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);
const KEY = "a11yze:analysis";
const DEVICE_KEY = "a11yze:device";

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);
  const [device, setDeviceState] = useState<Device>("desktop");

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setAnalysis(JSON.parse(raw));
      const d = sessionStorage.getItem(DEVICE_KEY);
      if (d === "mobile" || d === "desktop") setDeviceState(d);
    } catch {}
    setReady(true);
  }, []);

  const setDevice = useCallback((d: Device) => {
    setDeviceState(d);
    try {
      sessionStorage.setItem(DEVICE_KEY, d);
    } catch {}
  }, []);

  const analyze = useCallback(async (url: string, locale: Lang) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, locale }),
      });
      const data = await res.json().catch(() => ({ error: "generic" }));
      if (!res.ok || data.error) {
        setError((data.error as ErrorCode) ?? "generic");
        return;
      }
      setAnalysis(data as Analysis);
      try {
        sessionStorage.setItem(KEY, JSON.stringify(data));
      } catch {}
    } catch {
      setError("generic");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
  }, []);

  return (
    <Ctx.Provider value={{ analysis, ready, loading, error, device, setDevice, analyze, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalysis must be used inside AnalysisProvider");
  return ctx;
}
