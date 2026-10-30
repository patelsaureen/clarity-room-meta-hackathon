# Clarity Room — The Decision Experiment

**A small experiment is often more useful than a confident answer.**

Clarity Room is a live, nonclinical decision-experiment prototype built for the **Meta Global AI Developer Hackathon 2026**, Indie Developer track / **Build for Your World** theme.

- **Live demo:** https://clarity-room-meta-hackathon.vercel.app
- **Submission materials and three-minute storyboard:** [SUBMISSION_KIT.md](./SUBMISSION_KIT.md)
- **Core AI model:** Meta Muse Spark 1.3 via Meta Model API

## How it works

1. **Describe:** Enter a decision in an editable text box or use optional browser speech recognition.
2. **Ground:** Two Muse Spark roles—Extractor and Challenger—independently identify reported facts, assumptions, uncertainties and trade-offs. Code validates exact source quotes and character offsets, then filters unsupported and duplicate findings.
3. **Review:** The user reclassifies or removes findings and edits a proposed brief, reversible information-gathering experiment.
4. **Predict and lock:** The user reviews and locks a testable prediction. A random private return token points to a Neon/Postgres record. The server-side database trigger protects the original prediction.
5. **Return and learn:** The user reports what happened. Muse Spark generates Decision Map v2: observed, learned, changed and still uncertain. The original prediction remains visible.

## Architecture

```text
Next.js browser UI (optional Web Speech API)
     |
     +--> /api/analyze --> Meta Muse Spark 1.3 Extractor + Challenger (parallel)
     |                 --> deterministic exact-quote validation and deduplication
     |                 --> Meta Muse Spark Experiment Designer
     |
     +--> user reviews findings, action and prediction
     |
     +--> /api/lock --> Neon Postgres immutable original + SHA-256 token hash
     |
     +--> /api/return --> original locked prediction
     +--> /api/outcome --> Meta Muse Spark reflection --> Decision Map v2
     +--> /api/delete --> permanent deletion by private token
```

**Stack:** Next.js, React, TypeScript, Vercel, Meta Model API, Neon Postgres, browser Web Speech API (where supported).

## Privacy and limitations

Clarity Room is not therapy, diagnosis, emergency support or professional advice. Users are asked not to enter sensitive personal information. The analysis sends submitted text to Meta Model API. Locked experiment records are accessible to anyone with the private return link; protect it. Records expire after 30 days and can be deleted early with the private token. Expired-record deletion is performed opportunistically when the database is accessed. Browser speech recognition is optional and varies by browser and microphone permission. User-reported statements are not independently verified facts.

## Run locally

```bash
npm install
npm run dev
```

Set environment variables `MODEL_API_KEY` (Meta Model API) and `DATABASE_URL` (Postgres/Neon) in a local `.env.local` file; **never commit secrets**. The database schema is initialized on first access.

## Demo scenario

> I was offered a team lead role. It pays more, but I worry I will spend all day in meetings. I enjoy helping teammates one-on-one. I don't know how much time the role actually spends in meetings.

The experiment should be a short, consent-based conversation or observation to learn about the actual work before committing to the role. The return outcome shown in the submission demo should be clearly identified as a fictional example.

## Status

Core API round-trip and privacy deletion have been live-tested previously; user-provided real-device recording confirmed voice transcription. Final video recording, current-build regression test and authenticated submission are still pending. See [SUBMISSION_KIT.md](./SUBMISSION_KIT.md) for the detailed readiness checklist.
