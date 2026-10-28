import { NextResponse } from "next/server";
import { askMuse } from "@/lib/meta";
import { isUnsafe, validateFindings } from "@/lib/analysis";

export const runtime = "nodejs";
export const maxDuration = 60;

const extractor = `You are the Extractor. Extract up to 7 findings in categories reported_fact, assumption, uncertainty, tradeoff. Every finding must cite an EXACT contiguous quote and start/end character offsets in the source. Output JSON {"findings":[{"category":"reported_fact","text":"...","quote":"...","start":0,"end":10}]}.`;
const challenger = `You are the Challenger. Independently identify up to 5 assumptions, uncertainties, or tradeoffs the speaker actually expresses. Do not invent facts or concerns. Each finding must have an EXACT contiguous quote and start/end character offsets. Output JSON {"findings":[{"category":"assumption","text":"...","quote":"...","start":0,"end":10}]}.`;

export async function POST(request: Request) {
  let source: unknown;
  try { source = (await request.json()).text; } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (typeof source !== "string" || source.trim().length < 20 || source.length > 6000)
    return NextResponse.json({ error: "Please provide 20–6000 characters." }, { status: 400 });
  if (isUnsafe(source)) return NextResponse.json({ error: "This tool cannot safely guide this situation. If you or someone else is in immediate danger, contact local emergency services. In the U.S., call or text 988 for crisis support.", safety: true }, { status: 422 });
  if (!process.env.MODEL_API_KEY) return NextResponse.json({ error: "Meta API is not configured yet." }, { status: 503 });
  try {
    const [a, b] = await Promise.allSettled([askMuse(extractor, source), askMuse(challenger, source)]);
    if (a.status === "rejected" && b.status === "rejected") throw new Error("BOTH_AGENTS_FAILED");
    const av = a.status === "fulfilled" ? validateFindings(source, a.value, "extractor") : { findings: [], rejected: 0 };
    const bv = b.status === "fulfilled" ? validateFindings(source, b.value, "challenger") : { findings: [], rejected: 0 };
    const findings = [...av.findings, ...bv.findings];
    if (!findings.length) return NextResponse.json({ error: "No source-grounded findings passed validation. Please revise your wording and try again." }, { status: 422 });
    const design = await askMuse(`You are the Experiment Designer. Use ONLY the validated findings supplied. Propose one low-risk, reversible, consent-based experiment for a non-clinical decision, with an editable prediction. Do not recommend financial commitments, risky actions, or medical/mental-health treatment. If no safe experiment is possible, return null for experiment. Output JSON {"experiment":{"action":"...","duration":"...","prediction":"...","safetyNote":"..."}} or {"experiment":null}.`, JSON.stringify(findings));
    const e = design && typeof design === "object" ? (design as { experiment?: unknown }).experiment : null;
    const experiment = e && typeof e === "object" && ["action","duration","prediction","safetyNote"].every(k => typeof (e as Record<string, unknown>)[k] === "string")
      ? Object.fromEntries(["action","duration","prediction","safetyNote"].map(k => [k, String((e as Record<string, unknown>)[k]).slice(0, 600)])) : null;
    return NextResponse.json({ findings, rejected: av.rejected + bv.rejected, experiment, model: "muse-spark-1.3", pipeline: ["extractor", "challenger", "source-validation", "experiment-designer"], degraded: a.status === "rejected" || b.status === "rejected" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Meta analysis could not finish. Please try again later." }, { status: 502 });
  }
}
