# Next Steps ATX

**The Austin Benefits Navigator** — a free, private, bilingual web app that helps people in Austin and Travis County figure out their actual next step, not just hand them a list of phone numbers.

Built for the Congressional App Challenge, Texas 37th District.

---

## Why I made this

Austin has a genuinely huge amount of help available. Food benefits, rent assistance, free clinics, job training, legal aid, utility discounts — it's all out there, and a lot of it is good.

The problem is that it's scattered across dozens of agencies and nonprofits, each with its own website, its own paperwork, its own service area, and its own rules about who qualifies. If you're already having the worst month of your life, "here are 40 organizations, good luck" is not help. It's homework.

And the thing that kept bothering me is that the deadlines are the part nobody tells you about. If you get eviction papers in Texas, you have **five days** after the judge signs the judgment to appeal — weekends and holidays count. If you lose your job, your unemployment claim starts the week you file, so every week you wait is a week you don't get paid for. Those are the facts that actually change what happens to someone, and they're buried in PDFs.

So I wanted to build something that does what a really good caseworker does: listen to what's going on, tell you the time-sensitive stuff first, and then hand you an ordered plan — today, this week, this month — instead of a directory.

That's what this is.

---

## What it does

**Start from your situation.** Fourteen life situations on the home page: behind on rent, lost my job, new baby, can't keep up with bills, not safe at home, aging out of foster care, a fresh start after a record, homeowner costs, starting a business, and more. Each one opens with the deadlines and facts that matter most, every single one linked to an official source.

**Get a plan, not a list.** After you confirm a few details about your household, you get a plan sorted into **Today: get steady** → **This week: apply** → **This month: build ahead**. Every item tells you *why* it's in that phase and what the first concrete move is. One tap saves the whole plan to My steps.

**My steps.** One "your next step" card at the top, a progress bar, and every saved service collapsed to a single line so it doesn't turn into a wall. Print it or download it. It works offline.

**Career & résumé builder.** Type in the jobs you've had — including family businesses, gig work, military service, caregiving — and it recognizes the transferable skills you already have and matches you to career paths. Every path starts free (Austin Public Library courses) and ends with a credential employers actually recognize: Google Career Certificates, freeCodeCamp, Intuit Bookkeeping, OSHA 10, Texas food handler, CDA. It links to **O\*NET** (the U.S. Department of Labor's database) for real pay and job outlook — I never made up a salary number. Then it builds you a real, formatted résumé you can print, download for Word, or copy as text.

**Interview practice.** Eight common questions with why employers ask them and how to answer, a STAR answer builder, and honest guidance on explaining a work gap or a criminal record.

**Money check & debt planner.** A private monthly budget that flags housing cost burden using HUD's 30% / 50% definitions and points you to help for your biggest costs. The debt planner compares snowball vs. avalanche and shows your payoff date and how much interest you'd save.

**Nearby help.** 196 real Austin locations — libraries, clinics, WIC offices, rec centers, neighborhood centers — with an opt-in map.

**68 reviewed services** across food, housing, health, utilities, work, transportation, family, education, money, pets, safety and legal help.

---

## What makes it different

There are already good directories out there — 2-1-1 Texas, findhelp.org, Benefits.gov. I use them. But they all answer the question *"what exists?"*

This answers *"what do I do first?"*

- **It's a plan, in order.** Not a search result. Safety and legal deadlines first, applications second, longer-term stuff third.
- **It builds real things.** A résumé. An interview answer. A debt payoff date. A printed checklist you can carry into an office.
- **Nothing is made up.** Every program links to an official source with the date I checked it. The test suite fails if a program is missing a source. The local guide that reads your description is a deterministic keyword interpreter I wrote — not an LLM — so it's testable and it never hallucinates a phone number.
- **It never says you qualify.** Only an agency can decide that. The app says "worth checking" and tells you exactly what's left to confirm.
- **It's genuinely private.** No accounts, no analytics, no tracking. Your household answers live in the browser tab and are never saved.
- **It's for everyone.** Bilingual, works offline, works on an old phone — and it's just as useful for a homeowner protesting their property appraisal as for someone facing eviction.

---

## Privacy — the part I care about most

People in crisis are asked to hand over their personal information constantly, and most of them have no idea where it goes. I didn't want to be another one of those.

- **No accounts. No analytics. No tracking of any kind.**
- Your household answers, income, work history, budget, debts and résumé text stay **in the browser tab only**. They're never saved to a server. Refreshing clears them.
- **My steps** is the one thing that's stored, and only if you explicitly tap save. It stores *program IDs and checkbox progress only* — no household answers, no income, no names, no documents. It lives in your own browser under `austin-benefits:steps:v1`. Anyone else using the same browser profile can see it, which the app tells you.
- The **optional AI helper** is off unless a provider is connected, and even then it requires you to open the panel, read the exact text being sent, and consent per request. It can only suggest need *categories* — never advice, URLs, phone numbers or eligibility decisions. Those always come from the reviewed catalog.
- The **map is opt-in.** Loading it shares your IP and the viewed area with OpenStreetMap. Tiles send only the app's origin as a referrer, never page paths or your answers.
- **Voice input** requires explicit permission and, without it, the app refuses to fall back to a remote recognizer.
- A **Quick exit** button appears when someone is using the safety pathway.

---

## Where the information comes from

Every program entry carries its own official source URLs, a review date, service area, and intake-status caveats. A review date means "I read this page on this date" — **not** "this program has funding right now." Only the provider can tell you that.

Place, housing and equity data come from the [City of Austin Open Data Portal](https://data.austintexas.gov):

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

Some of those city datasets haven't been republished since 2018–2019. Buildings don't usually move, but hours and services change constantly, so the app tells people to **call ahead** and the About page discloses the age of every dataset.

Austin 3-1-1 no longer has a public submission API (the city moved to Spot311), so the app educates and deep-links to `311.austintexas.gov` rather than pretending to submit a request for you.

**Things I deliberately refused to do:** invent Federal Poverty Level cutoffs for programs that don't use them (TANF, SSI, EITC), claim a program is "accepting applications" because its website exists, or imply a ZIP code establishes county residency. Those shortcuts would make the app feel smarter and would get real people turned away at a real office.

---

## Tech

- React 19 + TypeScript + Vite
- `vite-plugin-pwa` — installable, works offline after the first load
- Leaflet + OpenStreetMap for the opt-in map
- Self-hosted Public Sans (body) and Fraunces (headings), so typography works offline too
- Vitest — **380 tests**
- Playwright-driven browser smoke tests — 13 scenarios against a real production build
- The whole core is client-side and can be hosted as static files. The optional AI bridge is a separate Node service with no extra runtime dependencies.

### Project structure

```
scripts/
  build-places.mjs      Normalizes Austin open data into typed app data
  audit-resources.mjs   Flags stale or unsourced catalog entries
  smoke.mjs             Browser scenarios against a production build
server/
  ai-service.ts         Optional, bounded AI bridge (not required)
src/
  App.tsx               Routing and views
  components/
    Pathways.tsx        Life situations + quick exit
    ActionPlan.tsx      The today / this week / this month plan
    CareerBuilder.tsx   Experience → pathways → résumé → interview
    SkillPicker.tsx     Browsable skill library
    InterviewPractice.tsx
    MoneyCheck.tsx      Budget + HUD cost burden
    DebtPlanner.tsx     Snowball vs. avalanche
    ProgramViews.tsx    Program cards, detail dialog, My steps
    HelpMap.tsx         Lazy-loaded Leaflet map
  lib/
    navigator.ts        On-device bilingual text interpreter (no LLM)
    eligibility.ts      Screening engine — relevance, never approval
    plan.ts             Phased plan, document list, call script
    career.ts           Career matching, résumé tips, résumé export
    money.ts            Budget math + HUD cost-burden thresholds
    debt.ts             Snowball / avalanche simulation
    emergency.ts        Conservative present-tense safety routing
    steps.ts            Saved plan storage (IDs only)
    i18n.ts             English + Spanish UI strings
  data/
    catalog-*.ts        The 68 reviewed services, with sources
    pathways.ts         14 life situations with cited facts
    careers.ts          12 career tracks + past-job skill families
    skills.ts           Browsable skill library
    interview.ts        Interview questions and STAR coaching
    places.ts           GENERATED — 196 Austin locations
    housing.ts          GENERATED — 712 income-restricted developments
```

---

## Run it yourself

You'll need Node 22.14 or newer.

```bash
git clone https://github.com/AdyaS2010/next-steps-atx.git
cd next-steps-atx
npm install
npm run dev          # http://localhost:5173
```

Other commands:

```bash
npm test             # 380 unit tests
npm run lint
npm run build        # production build in dist/
npm run preview      # preview the production build
npm run serve        # standalone Node server (build first)
npm run test:smoke   # browser scenarios; needs a preview running on 127.0.0.1:4173
npm run audit:resources -- --as-of=2026-10-24
```

`audit:resources` checks every catalog entry for a source, a review date, a service area and next steps, and flags anything older than 90 days. Add `--links` to check that the official URLs still resolve. A working link doesn't verify that a program's rules or funding are unchanged — that still takes a human.

---

## Deploying

The app is configured for **Vercel** and deploys as a static site. `vercel.json` sets the build, the SPA rewrite, cache headers for hashed assets, and security headers (`no-referrer`, `nosniff`, HSTS, frame denial).

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Vite** (auto-detected). Build: `npm run build`. Output: `dist`.
3. Deploy. No environment variables needed.

The optional AI endpoint (`/api/ai/*`) doesn't exist on a static deploy, and that's fine — the app checks for it, finds nothing, and hides the AI panel entirely. Everything else works, including offline mode.

### If you want to turn on the optional AI

It needs a Node server (`npm run serve`), not static hosting. Set these on the **server process only** — never as `VITE_*` variables, which would ship the key to the browser:

| Variable | Purpose |
|---|---|
| `BENEFITS_AI_URL` | OpenAI chat-completions URL, or an Azure OpenAI deployment URL with its `api-version` |
| `BENEFITS_AI_KEY` | Server-only provider key. Never commit this. |
| `BENEFITS_AI_MODEL` | Model ID (required for OpenAI, optional for Azure deployment URLs) |
| `PORT` | Optional; defaults to 4173 |

The server accepts only same-origin bounded requests, rate-limits, validates the model's output against a strict schema, blocks provider redirects, applies a deadline, and neither logs nor stores descriptions. A public deployment also needs TLS and deployment-level abuse protection.

---

## Accessibility and languages

Full English and Spanish throughout — not just the UI, but every program description, every next step, every interview tip. Keyboard-accessible dialogs with focus trapping, skip links, visible focus rings, 44px touch targets, `prefers-reduced-motion` support, and read-aloud where the browser has a local voice.

Spanish was machine-assisted and I'd genuinely love a native speaker to review it. If that's you, please open an issue — it's the single most valuable contribution right now.

---

## Honest limitations

I'd rather say this up front than have someone find out the hard way:

- **This is not an eligibility decision.** Only the agency can decide. The app is careful about this everywhere, on purpose.
- **It can't see live availability.** Waitlists, funding and appointment slots change daily. Always call ahead.
- **It can't assess an emergency.** The safety routing is deliberately conservative and will miss things. If someone is in danger, call 911.
- **It's not legal or immigration advice.** The legal content is general information with sources.
- **Some location data is from 2018–2019.** Disclosed in the app, but worth repeating.
- **Information goes stale.** The catalog needs a review every few months. `npm run audit:resources` exists for exactly this.

---

## Contributing

If you spot something wrong — a dead link, a changed phone number, a program that no longer exists, a bad Spanish translation — please open an issue. That's the most useful thing anyone can do here, because a wrong phone number in an app like this wastes a real person's afternoon.

If you work at an Austin organization and want your program listed or corrected, open an issue and point me at the official page. I only add things I can cite.

---

## License

**MIT** — see [LICENSE](LICENSE).

I picked MIT on purpose. If a nonprofit, a library, a school district or another city wants to take this and adapt it for their own community, they should be able to do that without asking me or hiring a lawyer. That's the whole point. A copyleft license would have made it harder for exactly the organizations I'd most want to use it.

The code is MIT. The bundled data and photo have their own terms, which are spelled out in the LICENSE file.

---

## Credits

Landing photo: **Pennybacker Bridge September 2018** by **Haythemhammour**, [CC0 1.0 on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pennybacker_Bridge_September_2018.jpg). Resized and cropped for display; the scene itself isn't altered.

Data: City of Austin Open Data Portal. Program information: the agencies and nonprofits cited in each entry.

The navy-and-green civic design is *inspired by* Austin's service-first city website. It uses no City seal, logo or photography, and the app says clearly on every page that it's an independent community guide.

---

## Disclaimer

Next Steps ATX is an independent educational tool. It is **not** a government agency, not affiliated with the City of Austin or Travis County, and not a decision about your benefits. Information changes — always confirm directly with the organization.

If you're not sure where to start, call **2-1-1** or visit [211texas.org](https://www.211texas.org/). If someone is in immediate danger, call **911**.

Please don't submit names, identity documents, account credentials or benefit applications through this app. It isn't built to receive them, and it never asks for them.
