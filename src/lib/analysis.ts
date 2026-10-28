export type Finding = { id: string; category: "reported_fact" | "assumption" | "uncertainty" | "tradeoff"; text: string; quote: string; start: number; end: number; source: "extractor" | "challenger" };
export type Analysis = { findings: Finding[]; rejected: number; experiment: { action: string; duration: string; prediction: string; safetyNote: string } | null; model: string; pipeline: string[] };

type RawFinding = { category?: unknown; text?: unknown; quote?: unknown; start?: unknown; end?: unknown };
const categories = new Set(["reported_fact", "assumption", "uncertainty", "tradeoff"]);

export function validateFindings(source: string, raw: unknown, origin: "extractor" | "challenger") {
  const entries = raw && typeof raw === "object" && Array.isArray((raw as { findings?: unknown }).findings)
    ? (raw as { findings: unknown[] }).findings : [];
  const findings: Finding[] = [];
  let rejected = 0;
  for (const item of entries) {
    const f = item as RawFinding;
    if (!f || typeof f !== "object" || typeof f.text !== "string" || typeof f.quote !== "string" || !f.quote.trim() ||
        !Number.isInteger(f.start) || !Number.isInteger(f.end) || !categories.has(String(f.category))) { rejected++; continue; }
    const start = f.start as number, end = f.end as number;
    if (start < 0 || end > source.length || start >= end || source.slice(start, end) !== f.quote) { rejected++; continue; }
    findings.push({ id: `${origin}-${findings.length + 1}`, category: f.category as Finding["category"], text: f.text.slice(0, 350), quote: f.quote, start, end, source: origin });
  }
  return { findings, rejected };
}

export function isUnsafe(source: string): boolean {
  return /\b(suicid(?:e|al)|kill myself|self[- ]harm|hurt myself|overdose|harm someone|kill (?:him|her|them)|medical diagnosis|stop (?:my )?medication)\b/i.test(source);
}

/** Remove repeated claims from parallel agents while retaining the first verified citation. */
export function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter(f => {
    const normalized = f.text.toLowerCase().replace(/^(user reports?|speaker (?:states?|assumes?|weighs?)|user (?:assumes?|does not know))\s+/,"").replace(/[^a-z0-9]+/g," ").trim();
    const key = f.category + ":" + f.quote.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    const alt = f.category + ":" + normalized;
    if (seen.has(key) || seen.has(alt)) return false;
    seen.add(key); seen.add(alt); return true;
  });
}
