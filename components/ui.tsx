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
export function ArrowBadge({ tone = "ink" }: { tone?: "ink" | "cream" | "violet" }) {
  const styles = {
    ink: "bg-ink text-cream",
    cream: "bg-cream text-ink",
    violet: "bg-violet text-ink",
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
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  empty: "bg-sand ring-1 ring-ink/20",
  manual: "bg-violet",
};

export function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

/**
 * Termómetro horizontal: bulbo + tubo que se llena según el % de chequeos que pasan.
 * Verde ≥ 75 %, amarillo 40–74 %, rojo < 40 % (ver lib/scoring.ts).
 * Las marcas finas del tubo muestran dónde cambia de color. Es decorativo:
 * el estado siempre está también en texto al lado.
 */
export function Thermometer({ value, level, className = "", size = "md" }: { value: number; level: Level; className?: string; size?: "md" | "lg" }) {
  const fill = level === "empty" || level === "manual" ? "bg-sand" : LEVEL_DOT[level];
  const tube = size === "lg" ? "h-3.5" : "h-2.5";
  const bulb = size === "lg" ? "size-6" : "size-4";
  return (
    <div className={`flex items-center ${className}`} aria-hidden="true">
      <span className={`relative z-10 shrink-0 rounded-full ring-[3px] ring-current/15 ${bulb} ${fill}`} />
      <span className={`relative -ml-1.5 flex-1 overflow-hidden rounded-r-full bg-current/10 ${tube}`}>
        <span
          className={`absolute inset-y-0 left-0 origin-left animate-fill rounded-r-full ${fill}`}
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
        {[40, 75].map((m) => (
          <span key={m} className="absolute inset-y-0 w-px bg-current/25" style={{ left: `${m}%` }} />
        ))}
      </span>
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

/** Devuelve el valor recién cuando dejó de cambiar durante `delay` ms. */
export function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
