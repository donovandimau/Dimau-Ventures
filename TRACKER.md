# TRACKER — Dimau Ventures Ltd (UK company site)

> **Every AI: read this whole file before you start any work on this project, and update it before you finish — in the same commit as your work.**
> Newest entries go at the TOP of each section. If something is listed under *In progress* or *Done*, do not redo it: carry it on, or check with Donovan.
> Work that applies to **every** project (shared rules, rollouts, new-project checklist) lives on the main board: `donovandimau/dimau-ops` → `ALL-PROJECTS.md`. Check it too, and tick this project off there when you apply a rollout here.

## Project
- Ops Room card: `platform-dimau-ventures`
- Code: https://github.com/donovandimau/dimau-ventures
- Live: https://dimauventures.com/

## Current state
- 2026-11-05 phone-footer branding: branded JPEG artwork is prepared and locally verified; normal checked publication evidence belongs to its scoped PR.
- 2026-11-05 photo revision: phone-preview photographs are prepared and locally verified; exact publication evidence belongs to the scoped PR.
- Status: Live — Live — company site serving as Stripe business website (80% complete)
- Next action: Verify the legal entity in Stripe and the business application in Starling. Keep the existing payout destination until a suitable business account is verified and the change is authorised.
- Blocker: none recorded

## In progress — claim a task here BEFORE you start it
| Started | AI | Task | Branch / PR |
|---|---|---|---|

## Do not change
- nothing recorded yet

## Last handover
- 2026-11-01 — Deployment: Count visits on the Ops Room (Fiji Analytics tag, no cookies)
- Testing: not tested

## Done — newest first
- 2026-11-06 — Codex — Added safe response headers (nosniff and strict-origin-when-cross-origin), preserving existing stronger policies, routing, caching and embedding. JSON and baseline JavaScript/CSS MIME checks pass; hosted checks and live readback belong to the scoped security PR.
- 2026-11-06 — Codex — Added valid UTF-8 XML sitemap and robots discovery for the verified public canonical pages; excludes account/API paths and keeps private data out of the URL list. XML parsing and source diff checks pass; hosted gates and production verification are recorded in the scoped PR.
- 2026-11-05 — Codex — Verified the [Companies House record](https://find-and-update.company-information.service.gov.uk/company/17555886) and added company number 17555886 to the website footer and company section. Updated the service worker revision so returning visitors receive the revised page. Publication is verified separately through the deployment.
- 2026-11-05 — Codex — Added the genuine Dimau D logo and “Dimau Group” inside each phone-screen white footer in the existing photorealistic link preview. Retained photographs, UI labels/values, demo qualifiers, exterior copy and public image URLs. All replacement JPEGs decode at 1200 × 630 and pass individual visual review; exact prompts and hashes are in `docs/phone-preview-branding-20261105.md`.
- 2026-11-05 — Codex — Replaced the existing phone-preview artwork with app-specific photorealistic imagery. Preserved exterior brand/copy, meaningful screen figures, sample/demo labels, existing asset URLs and all application code. JPEG decoding and 1200 × 630 dimensions pass; exact generation prompts and image hashes are in `docs/phone-preview-photography-20261105.md`. This records completed image preparation, not a production receipt.
- 2026-11-04 — Codex — Completed scoped public preview metadata correction. Completed canonical and matching X preview details while retaining the original app-specific 1200 by 630 artwork and all page body bytes. Source whitespace checks pass; host gates and exact hosted evidence follow on this revision’s PR.
- 2026-11-01 — claude — Count visits on the Ops Room (Fiji Analytics tag, no cookies) — 1 file(s) on main: index.html
- 2026-11-01 — claude — Proper 1200x630 link-preview picture (was the 160px logo, blurry when shared) — 2 file(s) on main: og-dimau-ventures.jpg, index.html
- 2026-11-01 — claude — Load the shared Dimau consistency standard (44px header controls, title cap, Dimau Group footer)  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> Claude-Session: https://claude.ai/code/session
- 2026-11-01 — claude — Automatically merged revision #2 after technical checks
- 2026-10-31 — claude — Opened pull request #2: Dimau PWA kit: install prompt, update bar, bottom sheet, date picker
- 2026-10-31 — claude — Load Dimau PWA kit (1 replacement(s) in index.html on feature/pwa-kit)
- 2026-10-31 — claude — Add Dimau PWA kit (install prompt, update bar, bottom sheet, date picker)  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com> Claude-Session: https://claude.ai/code/session_014dUrto2KoCAsc4GVA1W
- 2026-10-30 — claude — Closed pull request #1 without merging: Applied directly to main; this repo has no preview reporting for the merge gate.
- 2026-10-30 — claude — Redirect the vercel.app address to dimauventures.com (vercel.json on main)
- 2026-10-30 — claude — Trigger preview build (vercel.json on claude/redirect-to-domain)
- 2026-10-30 — claude — Opened pull request #1: Redirect the vercel.app address to dimauventures.com
- 2026-10-30 — claude — Redirect the vercel.app address to dimauventures.com (vercel.json on claude/redirect-to-domain)

_Seeded 2026-11-02 from the Ops Room. From here on, this file is the record for this project._
