# Next Steps ATX

**The Austin Benefits Navigator.** A free, private, bilingual web app for people in Austin and Travis County. It doesn't just list what help exists. It tells you what to do first.

Built for the Congressional App Challenge, Texas 37th District.

## Why I built this

Austin has a lot of help available. Food benefits, rent assistance, free clinics, job training, legal aid, utility discounts. Most of it is genuinely good, and most of it is run by people who care a great deal.

The trouble is that it lives in about forty different places. Every agency and nonprofit has its own website, its own paperwork, its own service area, and its own rules about who qualifies. When someone is already having the worst month of their life, handing them a directory isn't help. It's homework.

The part that really got to me was the deadlines, because nobody mentions those until it's too late to use them. If you get eviction papers in Texas, you have five days after the judge signs the judgment to appeal, and weekends and holidays count against you. If you lose your job, your unemployment claim starts the week you file it, so every week you spend figuring things out is a week you never get paid for. Both of those facts change what actually happens to a family. Both of them are buried in PDFs that nobody reads for fun.

So I tried to build what a good caseworker does. Listen to what's going on, say the time sensitive thing first, and hand over a plan in order instead of a list of phone numbers.

## What it does

**You start from your situation, not from a program name.** There are fourteen situations on the home page: behind on rent, lost my job, new baby, can't keep up with bills, not safe at home, aging out of foster care, a fresh start after a record, homeowner costs, starting a small business, and more. Each one opens with the facts that are actually urgent, and every single one of those facts links to the official source it came from.

**You get a plan, in order.** After you confirm a few details, the app sorts your options into *Today: get steady*, *This week: apply*, and *This month: build ahead*. Every item says why it's in that phase and what the first concrete move is. One tap saves the whole plan.

**My steps** keeps one "your next step" card at the top, a progress bar, and every saved service collapsed to a single line so it never turns into a wall of text. You can print it or download it, and it works with no internet.

**The career and résumé builder** takes the jobs you've actually had, including family businesses, gig work, military service, and caregiving, and figures out the transferable skills you already have. It matches you to twelve career paths. Each path starts with something free (Austin Public Library courses) and ends with a credential employers recognize: Google Career Certificates, freeCodeCamp, Intuit Bookkeeping, OSHA 10, the Texas food handler card, the CDA. For pay and job outlook it sends you to O\*NET, which is the Department of Labor's own database, because I was not going to make up salary numbers. Then it builds you a real formatted résumé you can print, download for Word, or copy as plain text.

**Interview practice** has eight common questions with why employers ask them and how to answer, a STAR answer builder, and honest coaching on explaining a gap in your work history or a criminal record.

**Money check and the debt planner** run a private monthly budget, flag housing cost burden using HUD's 30% and 50% thresholds, and point you toward help for your largest costs. The debt planner compares the snowball and avalanche methods and shows your payoff date and how much interest each one saves.

**Nearby help** lists 196 real Austin locations, including libraries, clinics, WIC offices, rec centers and neighborhood centers, with a map you have to opt into.

Altogether there are **68 reviewed services** covering food, housing, health, utilities, work, transportation, family, education, money, pets, safety and legal help.

## What makes it different

There are already good directories. 2-1-1 Texas, findhelp.org, Benefits.gov. I use them and I'm not trying to replace them. But they all answer the same question, which is *what exists near me*.

This app answers a different one: *what do I do first*.

A few specific things follow from that.

It gives you a sequence, not search results. Safety and legal deadlines come first, applications second, longer term work third, and the app explains its reasoning each time.

It produces something you can hold. A résumé. An interview answer. A payoff date. A printed checklist you can carry into an office and put on the table.

Nothing in it is invented. Every program links to an official source with the date I checked it, and the test suite fails the build if a program is missing one. The local guide that reads what you type is a keyword interpreter I wrote by hand, not a language model, so it's fully testable and it cannot hallucinate a phone number that doesn't exist.

It never tells you that you qualify. Only an agency can decide that. The app says "worth checking" and then lists exactly what's left to confirm, which is less satisfying to build but a lot more honest.

It's private in a way you can verify by reading the code, which I'll get into below.

And it's genuinely for everyone. It's just as useful to a homeowner protesting their property appraisal as it is to someone who just got eviction papers.

## Privacy, which is the part I care about most

People in a crisis get asked to hand over personal information constantly, usually with no idea where any of it ends up. I didn't want to be one more place doing that to them.

No accounts. No analytics. No tracking of any kind, anywhere in the app.

Your household answers, income, work history, budget, debts and résumé text stay in the browser tab and nowhere else. They are never sent to a server. Refreshing the page clears them, which is why the app reminds you to download or print your résumé before you leave.

**My steps** is the only thing that gets stored, and only when you tap save. It holds program IDs and checkbox progress. That's it. No household answers, no income, no names, no documents. It lives in your own browser under `austin-benefits:steps:v1`, and the app tells you plainly that someone else using the same browser profile could see it.

The **optional AI helper** stays hidden unless a provider is actually connected. Even then it requires you to open the panel, read the exact text that would be sent, and consent for that one request. All it can do is suggest need *categories*. It cannot produce advice, URLs, phone numbers, dollar amounts or eligibility decisions. Those always come from the reviewed catalog instead.

The **map is opt in**, because loading it shares your IP address and the area you're looking at with OpenStreetMap. Tiles send only the app's origin as a referrer, never the page path and never your answers.

**Voice input** needs explicit permission, and without it the app refuses to quietly fall back to a remote recognizer.

A **Quick exit** button appears whenever someone is using the safety pathway.

## Where the information comes from

Every entry carries its own official source URLs, a review date, a service area, and notes about intake status. A review date means "I read this page on this day." It does not mean the program has funding right now. Only the provider can tell you that, and the app says so every time.

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
| Safety-net vaccine and FQHC providers | `87b4-3p9b` | 2019-04 |
| Austin Public Health Locations (WIC, Neighborhood Centers) | `6v78-dj3u` | 2018-07 |

Some of those city datasets haven't been republished since 2018 or 2019. Buildings don't usually move, but hours and services change all the time, so the app tells people to call ahead and the About page discloses how old every dataset is.

Austin 3-1-1 no longer has a public submission API, since the city moved to Spot311. So the app explains 3-1-1 and links straight to `311.austintexas.gov` rather than pretending it can file a request on your behalf.

There are also things I decided not to do, and I think those matter as much as the features. I didn't invent Federal Poverty Level cutoffs for programs that don't actually use them, like TANF, SSI and the EITC. I didn't mark a program as "accepting applications" just because its website loads. I didn't let a ZIP code stand in for proof of county residency. Every one of those shortcuts would have made the app feel smarter in a demo, and every one of them would get a real person turned away at a real front desk.

## Tech

React 19, TypeScript and Vite. `vite-plugin-pwa` makes it installable and fully usable offline after the first load. Leaflet and OpenStreetMap power the opt in map. Public Sans and Fraunces are self hosted, so the typography works offline too.

There are **380 unit tests** in Vitest, plus 13 browser scenarios driven by Playwright against a real production build.

The entire core runs client side and can be hosted as plain static files. The optional AI bridge is a separate Node service with no extra runtime dependencies, and the app is completely usable without it.

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
    Pathways.tsx        Life situations and quick exit
    ActionPlan.tsx      The today / this week / this month plan
    CareerBuilder.tsx   Experience, pathways, résumé, interview
    SkillPicker.tsx     Browsable skill library
    InterviewPractice.tsx
    MoneyCheck.tsx      Budget and HUD cost burden
    DebtPlanner.tsx     Snowball vs. avalanche
    ProgramViews.tsx    Program cards, detail dialog, My steps
    HelpMap.tsx         Lazy loaded Leaflet map
  lib/
    navigator.ts        On-device bilingual text interpreter, no LLM
    eligibility.ts      Screening engine. Relevance, never approval
    plan.ts             Phased plan, document list, call script
    career.ts           Career matching, résumé tips, résumé export
    money.ts            Budget math and HUD cost burden thresholds
    debt.ts             Snowball and avalanche simulation
    emergency.ts        Conservative present-tense safety routing
    steps.ts            Saved plan storage, IDs only
    i18n.ts             English and Spanish UI strings
  data/
    catalog-*.ts        The 68 reviewed services, with sources
    pathways.ts         14 life situations with cited facts
    careers.ts          12 career tracks and past-job skill families
    skills.ts           Browsable skill library
    interview.ts        Interview questions and STAR coaching
    places.ts           GENERATED. 196 Austin locations
    housing.ts          GENERATED. 712 income-restricted developments
```

## Run it yourself

You'll need Node 22.14 or newer.

```bash
git clone https://github.com/AdyaS2010/next-steps-atx.git
cd next-steps-atx
npm install
npm run dev          # http://localhost:5173
```

Everything else:

```bash
npm test             # 380 unit tests
npm run lint
npm run build        # production build in dist/
npm run preview      # preview the production build
npm run serve        # standalone Node server (build first)
npm run test:smoke   # browser scenarios; needs a preview on 127.0.0.1:4173
npm run audit:resources -- --as-of=2026-10-24
```

That last one checks every catalog entry for a source, a review date, a service area and next steps, and flags anything older than 90 days. Add `--links` and it will also check that the official URLs still resolve. A working link doesn't prove a program's rules or funding are unchanged, so that part still takes a person.

## Deploying

The app is set up for **Vercel** and deploys as a static site. `vercel.json` pins the build, rewrites only extensionless paths so the service worker and manifest are served directly, caches hashed assets immutably, and sets the same security headers as the standalone server.

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. The Vite preset is detected automatically. Build is `npm run build`, output is `dist`.
3. Deploy. There are no environment variables to set.

The optional AI endpoint doesn't exist on a static deploy, and that's completely fine. The app checks for it, finds nothing, and hides the AI panel. Everything else works, including offline mode.

### Turning on the optional AI

This needs the Node server (`npm run serve`) rather than static hosting. Set these on the server process only, never as `VITE_*` variables, which would ship your key to the browser.

| Variable | Purpose |
|---|---|
| `BENEFITS_AI_URL` | OpenAI chat-completions URL, or an Azure OpenAI deployment URL with its `api-version` |
| `BENEFITS_AI_KEY` | Server-only provider key. Never commit this. |
| `BENEFITS_AI_MODEL` | Model ID. Required for OpenAI, optional for Azure deployment URLs |
| `PORT` | Optional, defaults to 4173 |

The server only accepts same-origin bounded requests. It rate limits, validates the model's output against a strict schema, blocks provider redirects, applies a deadline, and neither logs nor stores what people type. A public deployment also needs TLS and abuse protection at the deployment level.

## Accessibility and languages

Everything is in English and Spanish. Not just the buttons, but every program description, every next step, and every interview tip.

Dialogs are keyboard accessible with proper focus trapping. There are skip links, visible focus rings, 44px touch targets, support for `prefers-reduced-motion`, and read aloud wherever the browser has a local voice available.

The Spanish was machine assisted and I would really love a native speaker to go through it. If that's you, please open an issue. It's honestly the most valuable thing anyone could contribute right now.

## What it can't do

I would rather say this clearly here than have somebody find out the hard way.

It is not an eligibility decision, and only the agency can make one. The app is careful about this everywhere, on purpose, even where that makes it feel less impressive.

It can't see live availability. Waitlists, funding and appointment slots change daily, so call ahead.

It can't assess an emergency. The safety routing is deliberately conservative and it will miss things. If someone is in danger, call 911.

It is not legal or immigration advice. The legal content is general information with its sources attached.

Some location data is from 2018 and 2019. That's disclosed inside the app, but it's worth repeating here.

And information goes stale. The catalog needs a review every few months, which is exactly why `npm run audit:resources` exists.

## Contributing

If you find something wrong, a dead link, a changed phone number, a program that closed, or a Spanish phrase that reads badly, please open an issue. That is the single most useful thing anyone can do here, because a wrong phone number in an app like this costs a real person an afternoon they could not spare.

If you work at an Austin organization and want your program added or corrected, open an issue and point me to the official page. I only add things I can cite.

## License

**MIT.** See [LICENSE](LICENSE).

I picked it deliberately. If a nonprofit, a library, a school district, or another city wants to take this and adapt it for their own community, they should be able to do that without asking me for permission or paying a lawyer to read the license first. That's the entire point. A copyleft license would have made life harder for exactly the organizations I most want using this.

The code is MIT. The bundled data and the photo keep their own terms, which are written out in the LICENSE file.

## Credits

The landing photo is **Pennybacker Bridge September 2018** by **Haythemhammour**, released under [CC0 1.0 on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pennybacker_Bridge_September_2018.jpg). I resized and cropped it for display. The scene itself isn't altered.

Data comes from the City of Austin Open Data Portal. Program information comes from the agencies and nonprofits cited in each entry.

The navy and green civic design is inspired by Austin's service-first city website. It uses no City seal, logo or photography, and every page states that this is an independent community guide.

## Disclaimer

Next Steps ATX is an independent educational tool. It is not a government agency, it is not affiliated with the City of Austin or Travis County, and it is not a decision about your benefits. Information changes, so please confirm directly with the organization.

If you aren't sure where to start, call **2-1-1** or visit [211texas.org](https://www.211texas.org/). If someone is in immediate danger, call **911**.

Please don't submit names, identity documents, account credentials or benefit applications through this app. It isn't built to receive them, and it will never ask you for them.
