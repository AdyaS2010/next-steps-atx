# Austin Benefits Navigator

A free, private, bilingual (English/Spanish) web app that helps Austin & Travis
County residents discover public benefits they may qualify for — and shows them
exactly where and how to apply. Built for the Congressional App Challenge
(Texas 37th district).

## The problem

Local help is spread across agencies with different service areas, intake
processes, documents, and eligibility rules. This app helps people understand
their options and take a concrete next step. It is not an eligibility decision,
live vacancy feed, or substitute for an agency or qualified counselor.

## What it does

- **Need-first mobile home:** describe a need or choose a large category button.
  The local guide uses explicit confirmation rather than silently treating
  inferred circumstances as facts.
- **Short, relevant questions:** yes, no, and unknown remain distinct. Each new
  request starts a fresh household. Income periods and uncertain interpretations
  are shown for review; ZIP proximity never establishes county eligibility.
- **Actionable recommendations:** the first three relevant services appear with
  reasons and details to confirm. More results and the full directory remain
  available. General information is not labeled universal eligibility.
- **47 reviewed services:** family, caregiver, older-adult, disability,
  employment, student, housing, veteran, newcomer, transportation, and pet-care resources.
  Source dates, service areas, application-status caveats, and action types are
  visible. Only providers can confirm current intake and eligibility.
- **Pets & vet care:** Emancipet clinics and Free Days, Meals on Wheels PALS,
  APA! PASS referrals, and the AHS pantry pause notice. Pet descriptions do not
  create human health/household assumptions or lead to human clinic pins. Urgent
  animal concerns point to veterinary help; mixed human emergencies retain their
  human emergency route. Routine assistance is not emergency veterinary care.
- **My steps:** optional browser-local service and checklist identifiers, with
  printable/downloadable public guidance. No household, income, raw descriptions,
  personal notes, identification numbers, or documents are saved.
- **List-first nearby help:** a historical snapshot of locations, with optional
  ZIP or location-based proximity and an opt-in external map. Not a live
  opening-hours, wheelchair-access, appointment, or transport-routing feed.
- **Housing inventory and 3-1-1:** retained as clearly labeled information.
  Income-restricted inventory does not mean vacant units or an open waitlist.
- **English and Spanish:** readable controls, keyboard-accessible dialogs,
  accessible navigation, local-voice read-aloud when available, and honest voice
  processing consent. Typing and category buttons remain available.
- **Installable PWA:** essential catalog and guidance work after an initial
  production load. External applications, map tiles, and optional AI need
  connectivity. Emergency situations take a separate route.

## Artwork

The landing page uses **Pennybacker Bridge September 2018** by **Haythemhammour**,
released under **CC0 1.0** on Wikimedia Commons:
https://commons.wikimedia.org/wiki/File:Pennybacker_Bridge_September_2018.jpg

The local `public/pennybacker-1920.jpg` and `public/pennybacker-960.jpg` derivatives
are resized/compressed (about 386 KB and 110 KB). Responsive display crops and
darkens the image; the scene is not altered. A visible source/license credit and
`public/pennybacker-photo-license.txt` document provenance and reuse terms.
The photo loads from this app, not an external image service, and both sizes are
included in the production offline cache. The form remains usable if it fails.
The earlier original `public/pennybacker.svg` illustration is retained as an asset.

The navy, cream and green civic design is inspired by Austin's service-first
website, not an imitation of government identity. No City seal, logo or City
website photo is used. The independent-guide notice remains visible in both
languages. Matching, consent and saved-plan behavior are unchanged.

## Local guidance and optional AI

The default guide (`src/lib/navigator.ts`) is a deterministic bilingual
interpreter, not an LLM. Matching uses reviewed catalog records and contextual
rules. Unanswered questions are unknown; relevance does not establish eligibility.
No automatic model request happens when someone uses the normal guide.

Optional AI can suggest **need categories only**, through `/api/ai/navigate`.
The user must open the optional panel, review the exact description and provider,
consent for that request, and explicitly apply the returned suggestions before
confirming details. AI cannot supply arbitrary advice, URLs, phone numbers,
benefit amounts, deadlines, or eligibility decisions. Those come from the catalog.
Unknown categories, extra fields, low-confidence output, network failure and
timeouts lead back to the local guide. No system can guarantee perfect
interpretation or live provider availability.

The optional server accepts only same-origin bounded requests, limits request
rate, validates output, disallows provider redirects, and applies a deadline.
It neither logs descriptions nor stores them. Provider retention policies still
apply after explicit consent. A public deployment also needs TLS, appropriate
provider terms, and deployment-level abuse protection.

### Connecting an optional provider

No provider or credentials are configured by default. Static hosting remains
fully usable without AI. To enable the optional service, supply environment
variables to the **server process**, never to the browser or a `VITE_*` variable:

| Variable | Purpose |
|---|---|
| `BENEFITS_AI_URL` | OpenAI `https://api.openai.com/v1/chat/completions`, or an Azure OpenAI deployment chat-completions URL including its supported `api-version` |
| `BENEFITS_AI_KEY` | Server-only provider key; never commit it or place it in source |
| `BENEFITS_AI_MODEL` | Required model ID for OpenAI; optional for deployment-based Azure URLs |
| `PORT` | Optional production server port; default 4173 |

Restart the Vite dev/preview process after configuring variables, or run
`npm run build` followed by `npm run serve`. The standalone server uses Node
22.14+ with type stripping, binds to `127.0.0.1`, and serves `dist` plus the
optional API. Use a properly configured HTTPS reverse proxy for public hosting.
`GET /api/ai/status` reveals only availability and the provider hostname.

### Voice limitations

Browser speech recognition may send audio to a browser-provider service.
Without explicit permission, the app requires `processLocally` support and
does not fall back to a remote recognizer. Language-pack availability can still
prevent dictation. Read-aloud uses an available local voice; errors leave the
text usable. Do not promise that voice works on every device or offline.

## Privacy

No accounts or analytics. Household answers stay in tab memory in the default
guide and are reset for each new request. Explicitly saved checklists use
`austin-benefits:steps:v1` and contain service/task IDs only. Other people using
the same browser profile may see saved selections; users can clear them.
Corrupt or denied storage produces a visible warning rather than false success.

Optional AI and browser-provider dictation require separate consent. An opt-in
map requests OpenStreetMap tiles; a centered viewport can reveal an approximate
area to that provider. Only tile requests send the real app origin as a referrer,
as required by OpenStreetMap; page paths, queries and household answers are not
included. Other requests retain the server's restrictive referrer default.
Application and direction links open external websites.
No names, identity documents, account credentials, or benefit applications should
be submitted through this app.

Map tiles use the documented `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
endpoint and the browser's normal HTTP cache, honoring the provider's expiry
headers. The PWA does not cache opaque tile responses or prefetch map areas.
HTTP errors (including an error returned as an image) stop map loading and show
a bilingual fallback with explicit retry; the service list remains usable.
Automated map scenarios mock the tile service rather than download live areas.

## Data & sources

Program entries carry their own official source URLs, review dates, geographic
scope, and intake-status caveats. A review date is not a live availability claim.
Approximate poverty comparisons alone must not decide eligibility; programs use
different household definitions, income calculations, categorical rules, and
exceptions. TANF, SSI and EITC must not be represented by invented FPL cutoffs.

### City of Austin Open Data Portal

Place, housing and equity data come from [data.austintexas.gov](https://data.austintexas.gov)
(a Socrata portal, which sends `Access-Control-Allow-Origin: *` and so can be
read directly from the browser). The existing historical snapshot is bundled
for offline use. `node scripts/build-places.mjs` only regenerates app files
from the local `raw` downloads; it does **not** download or verify fresh data.
Replace and review the raw source downloads before regeneration.

| Dataset | ID | Last published |
|---|---|---|
| Affordable Housing Inventory | `ifzc-3xz8` | 2026-07 |
| Levers of Economic Mobility Index | `8fgt-7i4v` | 2026-06 |
| Austin Pool Schedule | `xaxa-886r` | 2026-06 |
| Austin Public Library Locations | `tc36-hn4j` | 2025-10 |
| APR Recreation Centers | `8dff-2vkt` | 2024-06 |
| APR Senior Activity Centers | `3yna-uh9e` | 2024-06 |
| APH Social Service Vendors | `iicu-im5w` | 2019-12 |
| Safety-net vaccine/FQHC providers | `87b4-3p9b` | 2019-04 |
| Austin Public Health Locations (WIC, Neighborhood Centers) | `6v78-dj3u` | 2018-07 |

Some city location datasets have not been republished since 2018–2019. Building
locations are generally stable, but the app tells users to **call ahead to
confirm hours and services**, and the About page discloses the source and age of
every dataset.

Austin 3-1-1 no longer exposes a public Open311 submission API (the city moved
to the Spot311 platform), so the app **educates and deep-links** to
`311.austintexas.gov` and the 3-1-1 phone line rather than submitting on the
user's behalf.

Eligibility thresholds are approximate screening estimates. Only the
administering agency can determine actual eligibility. This app does not provide
legal or immigration advice.

## Tech stack

- React 19 + TypeScript + Vite
- `vite-plugin-pwa` (offline support + installable)
- `lucide-react` icons
- Vitest for the eligibility-engine unit tests
- Default core is client-side and can be statically hosted; optional Node AI
  bridge is separate and has no additional runtime dependencies

## Project structure

```
scripts/
  build-places.mjs     Normalizes Austin open data into typed app data
src/
  App.tsx              UI: home, screener, results, directory, near me, about
  index.css            Clawpilot theme + likelihood colors
  App.css              Layout + component styling
  types.ts             Household, Program, Place, HousingProject, etc.
  components/
    HelpMap.tsx        Leaflet map of nearby help (lazy-loaded)
  lib/
    eligibility.ts     Pure screening engine (FPL math + rules)
    eligibility.test.ts
    navigator.ts       On-device natural-language interpreter (AI front door)
    navigator.test.ts
    geo.ts             Haversine distance, ZIP centroids, sorting
    geo.test.ts
    voice.ts           Web Speech wrappers (dictation + read-aloud)
    format.ts          localize / normalize / tel helpers
    i18n.ts            English + Spanish UI strings
  data/
    programs.ts        Verified program catalog
    facts.ts           Awareness stats + category labels
    places.ts          GENERATED — 196 Austin help locations
    housing.ts         GENERATED — 712 income-restricted developments
    equity.ts          GENERATED — census-tract equity summary
    places-meta.ts     Place labels/colors + Austin 311 service guide
```

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # eligibility engine tests
npm run lint
npm run build    # production build in dist/
npm run preview  # production preview; optional AI middleware if configured
npm run serve    # Node production server; build first, Node 22.14+
npm run audit:resources -- --as-of=2026-09-12
npm run test:smoke # running production preview/server required at 127.0.0.1:4173
```

The resource audit checks metadata and review age without changing published
facts. Add `--links` to check official source reachability. HTTP success does not
verify program rules, intake, opening hours or housing vacancies.

The browser smoke scenarios use the existing `playwright-core` package and an
installed Microsoft Edge browser. Set `BENEFITS_BASE_URL` for another preview
address or `BENEFITS_BROWSER=chrome` for installed Chrome. They use isolated
browser profiles and mock the model provider; they never submit real applications
or send real user data to an AI provider.

## Disclaimer

Austin Benefits Navigator is an independent educational tool, not a government
agency and not a decision about your benefits. If you're not sure where to
start, call **2-1-1** or use the official 2-1-1 Texas website. Do not assume SMS
support or a particular office's availability without confirming it.
