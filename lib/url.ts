/** Normaliza lo que escribe la persona: agrega https:// y valida que sea una URL pública. */
export function normalizeUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let value = input.trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
  try {
    const u = new URL(value);
    if (!["http:", "https:"].includes(u.protocol)) return null;
    const host = u.hostname;
    if (!host.includes(".") || host === "localhost" || host.endsWith(".") || /\.\./.test(host)) return null;
    const tld = host.split(".").pop() ?? "";
    if (!/^[a-z\d-]{2,}$/i.test(tld) || /^\d+$/.test(tld)) return null;
    return u.toString();
  } catch {
    return null;
  }
}
