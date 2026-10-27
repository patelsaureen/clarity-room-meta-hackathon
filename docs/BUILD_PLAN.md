# Clarity Room — Hackathon Build Plan

Meta Global AI Developer Hackathon 2026 | Standalone submission

## Scope
Build a non-clinical, voice-first decision experimentation application. A user describes a decision, sees a provenance-grounded map of user-reported facts, assumptions, uncertainties and trade-offs, then locks one reversible experiment with a pre-registered prediction. On return, the app compares user-reported outcomes to that prediction and presents a traceable Map v2 diff.

## Guardrails
- All submission functionality is new hackathon work.
- Do not modify or copy code, data or secrets from the existing Inner Compass applications.
- Use Meta models for the application's actual reasoning and voice transcription.
- No mental-health diagnosis, therapy or personality classification.
- Confirm eligibility with organizers because the participant guide lists mental-health-advisor concepts among anti-projects.
- Keep all API keys server-side; use synthetic test transcripts until privacy safeguards are ready.

## Implementation sequence
1. Standalone Next.js/TypeScript skeleton and typed fallback.
2. Meta voice transcription and editable transcript with source offsets.
3. Parallel Extractor and Challenger; deterministic quote validation.
4. Experiment Designer using validated findings only.
5. Editable Map v1 and immutable prediction lock.
6. Secure return token and Map v2 observed/learned/changed/uncertain diff.
7. Safety tests, provenance tests, demo rehearsal and submission.

## Status
- 2026-10-26: Public repository created.
- GitHub connection verified; this file is the initial implementation planning artifact.
- Application implementation and Meta API integration are not yet complete.
