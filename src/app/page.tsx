"use client";

import { useMemo, useState } from "react";
import { segmentTranscript, quoteMatches } from "@/lib/transcript";

const sample = "I was offered a team lead role. It pays more, but I worry I will spend all day in meetings. I enjoy helping teammates one-on-one. I don't know how much time the role actually spends in meetings.";

export default function Home() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const segments = useMemo(() => segmentTranscript(submitted ?? ""), [submitted]);

  function reset() { setInput(""); setSubmitted(null); setAccepted(false); }

  return <main className="shell">
    <header className="topbar"><div className="brand"><span className="mark">✳</span><span>CLARITY <strong>ROOM</strong></span></div><span className="badge">HACKATHON BUILD · FOUNDATION</span></header>
    <section className="hero"><div className="eyebrow">A BETTER WAY TO DECIDE</div><h1>Clarity begins with<br/><em>one small experiment.</em></h1><p>Not an answer handed to you. A clearer picture of what you know, what you assume, and what you could safely test.</p></section>
    <section className="workspace">
      {!accepted ? <div className="card"><span className="step">BEFORE WE BEGIN</span><h2>Your decision stays yours.</h2><p>This is a non-clinical decision reflection tool, not therapy, medical advice, or emergency support. This early build keeps text in your browser session only; do not enter sensitive personal information.</p><label className="consent"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /> I understand and want to continue.</label></div>
      : submitted === null ? <div className="card"><span className="step">01 / DESCRIBE</span><h2>What's the decision on your mind?</h2><p>Write naturally. You can change your words before proceeding.</p><label htmlFor="decision" className="field-label">YOUR WORDS</label><textarea id="decision" value={input} onChange={(e) => setInput(e.target.value)} placeholder="I have an opportunity, but I'm not sure…" maxLength={6000} /><div className="actions"><button className="secondary" onClick={() => setInput(sample)}>Try example</button><button disabled={input.trim().length < 20} onClick={() => setSubmitted(input.trim())}>Continue →</button></div><p className="fine">Typed-input foundation only. Voice and Meta AI analysis are not connected yet.</p></div>
      : <div className="card"><span className="step">02 / CHECK YOUR WORDS</span><h2>Make sure we heard you correctly.</h2><p>These segments are split locally and linked to exact character positions in your text. They are <strong>not</strong> AI-generated facts or conclusions.</p><div className="quote-list">{segments.map((segment) => <div className="quote" key={segment.id}><span>{segment.id} · {segment.start}–{segment.end}</span><p>“{segment.text}”</p><small>{quoteMatches(submitted, segment) ? "✓ Exact source match" : "Source mismatch"}</small></div>)}</div><div className="actions"><button className="secondary" onClick={() => { setInput(submitted); setSubmitted(null); }}>← Edit my words</button><button onClick={reset}>Start over</button></div><p className="fine">Next milestone: Meta-powered Extractor + Challenger, provenance validation, and editable Decision Map v1. No analysis has been performed.</p></div>}
    </section>
    <footer>BUILT FOR THE META GLOBAL AI DEVELOPER HACKATHON 2026 · NEW, STANDALONE WORK</footer>
  </main>;
}
