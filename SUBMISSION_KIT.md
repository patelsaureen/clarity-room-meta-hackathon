# Clarity Room — Hackathon Submission Kit
_Last updated: 30 October 2026. This is a draft package, not a submission receipt._

## Submission fields (copy/paste)

**Project name:** Clarity Room — The Decision Experiment

**Track:** Indie Developer (verify against your accepted registration)

**Theme:** Build for Your World

**One-line pitch:** An evidence-grounded decision companion that turns uncertainty into a small, reversible experiment—then compares what happened with a prediction you cannot rewrite.

**Project description:**
Most AI decision assistants deliver a confident answer and stop. Clarity Room instead helps people learn what they actually need to know. A participant describes a real, nonclinical decision by typing or optional browser speech recognition. Meta Muse Spark 1.3 powers independent Extractor and Challenger roles to surface the participant's own reported facts, assumptions, uncertainties and trade-offs. Every accepted finding is anchored to an exact quote and character offsets from the source; invalid or duplicate findings are filtered, and the participant can edit or remove them.

An Experiment Designer role proposes one brief, low-risk, reversible information-gathering action and a falsifiable prediction. The participant reviews and edits both, then locks the prediction server-side. A private token links to a durable Neon/Postgres record with a database trigger that protects the original prediction from later updates. On return, the participant reports the outcome; Muse Spark produces Decision Map v2: what was observed, what was learned, what changed, and what remains uncertain. The original prediction remains visible and immutable.

This is not therapy or a tool for high-stakes advice. Users retain agency throughout. No account is required. Locked records expire after 30 days, can be deleted by the token holder, and are not meant for sensitive personal information.

**What Meta AI does:** Muse Spark 1.3 runs independent source-grounded extraction and challenge, proposes the reversible experiment, and reflects on user-reported outcomes. Deterministic code validates quotes and offsets, de-duplicates findings, checks user review, and enforces immutable storage.

**What makes it different:** A decision is treated as a testable hypothesis, not a one-shot recommendation. Grounding, editable review, an immutable prediction, and a return-with-evidence loop make uncertainty explicit.

**Live app:** https://clarity-room-meta-hackathon.vercel.app

**Source code:** https://github.com/patelsaureen/clarity-room-meta-hackathon

**Demo video:** NOT RECORDED / NOT VERIFIED. Add final hosted video URL after recording.

## Three-minute demo storyboard

**0:00–0:20 — The problem.** "AI often gives you a confident answer to a decision. But what if the right next step isn't a decision—it's a small experiment that teaches you something?"

**0:20–0:40 — Describe.** Show consent, then paste the fictional example or use a brief voice demonstration: "I was offered a team lead role. It pays more, but I worry I will spend all day in meetings. I enjoy helping teammates one-on-one. I don't know how much time the role actually spends in meetings." Say that speech recognition is browser-based and optional; typed input always works.

**0:40–1:15 — Evidence-grounded Map v1.** Continue, verify source segments, Analyze. Show reported facts, assumptions, uncertainties and trade-offs. Expand one source quote and explain that the app validates exact source offsets rather than accepting unsupported model claims. Show that categories can be changed and findings removed.

**1:15–1:45 — Reversible experiment.** Review the proposed low-risk action, duration and prediction. Edit the prediction to be testable. Confirm review and lock. Explain that the prediction is stored in Postgres and protected against revision after outcomes are known.

**1:45–2:25 — Return with evidence.** Open the private return link. To demonstrate a later return within one recording, use an explicitly fictional follow-up outcome: "In a short conversation, the current team lead said they spend about eight hours a week in meetings and still have time for one-on-one coaching. I now think the role may allow the part of the job I enjoy, but I still need to learn about peak weeks." Show Map v2: Observed / Learned / Changed / Still uncertain. Do not present the fictional outcome as real-world evidence.

**2:25–2:45 — Technical architecture.** Show a simple diagram or README section: browser speech/typed input → parallel Muse Spark Extractor and Challenger → deterministic quote validation → Muse Experiment Designer → user review → immutable Postgres prediction → Muse reflection on outcome.

**2:45–3:00 — Why it matters.** "Clarity Room doesn't decide for you. It helps you discover what you need to learn, records what you predicted, and lets you see what actually changed."

### Recording safeguards

- Use fictional, non-sensitive data and avoid showing private return tokens outside the demo.
- Have the return view ready in a separate browser tab if model latency is high.
- Do not edit video to imply an API result occurred when it did not. If switching to a previously completed fictional example, label it clearly.
- Check readable text, microphone permission, stop button, audio levels, video link permissions and total duration.
- Prefer a reliable typed walkthrough over an unreliable live microphone during the final recording.

## Submission readiness checklist

- [x] Application approval received (Oct 21, 2026).
- [x] Production deployment on Vercel reports READY for latest code commit as of Oct 30.
- [x] Core lock → return → outcome → Map v2 → duplicate-outcome rejection previously tested live.
- [x] Delete endpoint previously tested live (delete succeeds and old link returns 404).
- [x] User screen recording showed real-device voice transcription and timer.
- [ ] Recheck final voice-stop safeguard after latest deployment (code added; behavior not retested).
- [ ] Perform final full user-facing walkthrough of latest production build.
- [ ] Record, host and review actual demo video.
- [ ] Verify authenticated Cerebral Valley submission form fields and Official Rules; public unauthenticated page does not expose form.
- [ ] Add final demo URL and submit through authenticated portal; verify receipt.

**Official submission portal:** https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit

**Official event deadline:** Wednesday, November 4, 2026, 9:00 PM Eastern Standard Time (02:00 UTC November 5). Earlier submission is encouraged as soon as the package is complete.

**Known limitations:** Browser voice recognition depends on device/browser support and permission. Muse output can vary, and source-grounded statements are user-reported, not independently verified. Records are accessed by possession of a private token; losing the token prevents return. Opportunistic expiration cleanup runs on database access rather than on a separately scheduled job.
