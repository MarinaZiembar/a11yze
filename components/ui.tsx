"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { Level } from "@/lib/types";

/** Asterisco geométrico: logo y ornamento sutil. */
export function Asterisk({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-20 -20 40 40" className={className} aria-hidden="true" focusable="false">
      {[0, 45, 90, 135].map((r) => (
        <rect key={r} x="-3.2" y="-18" width="6.4" height="36" rx="3.2" transform={`rotate(${r})`} fill="currentColor" />
      ))}
    </svg>
  );
}

/** Círculo con flecha ↗ estilo referencia. Gira al hacer hover sobre la card (.card-link). */
export function ArrowBadge({ tone = "ink" }: { tone?: "ink" | "cream" | "flame" }) {
  const styles = {
    ink: "bg-ink text-cream",
    cream: "bg-cream text-ink",
    flame: "bg-flame text-ink",
  }[tone];
  return (
    <span className={`arrow grid size-9 shrink-0 place-items-center rounded-full ${styles}`} aria-hidden="true">
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
      </svg>
    </span>
  );
}

/** Renderiza `código` entre backticks como <code>. */
export function Inline({ text }: { text: string }) {
  const parts = text.split("`");
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <code key={i} className="rounded-md bg-current/10 px-1.5 py-0.5 font-mono text-[0.85em]">
            {p}
          </code>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export const LEVEL_DOT: Record<Level, string> = {
  good: "bg-lime",
  warn: "bg-flame",
  bad: "bg-ink",
  empty: "bg-mute",
  manual: "bg-lime",
};

export function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

/** Barra segmentada (como el progreso de la referencia lime). */
export function SegmentBar({ value, segments = 10, className = "" }: { value: number; segments?: number; className?: string }) {
  const filled = Math.round((value / 100) * segments);
  return (
    <div className={`flex gap-1 ${className}`} aria-hidden="true">
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-700 ${i < filled ? "bg-current" : "bg-current/15"}`}
          style={{ transitionDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  );
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Cuenta de 0 al valor. Respeta prefers-reduced-motion. */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}
