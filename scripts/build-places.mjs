/**
 * Build-time normalizer for City of Austin open data.
 * Reads the raw Socrata downloads in ./raw and emits typed app data files.
 *
 *   node scripts/build-places.mjs
 *
 * Re-run this to refresh the bundled snapshot from data.austintexas.gov.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const raw = (name) => JSON.parse(readFileSync(resolve(root, 'raw', `${name}.json`), 'utf8'))

const round = (n) => Math.round(Number(n) * 1e5) / 1e5

/** Socrata nests street data in a `human_address` JSON string. */
function humanAddress(field) {
  if (!field?.human_address) return {}
  try {
    return JSON.parse(field.human_address)
  } catch {
    return {}
  }
}

function coords(field) {
  if (!field) return null
  if (field.latitude && field.longitude) {
    return { lat: round(field.latitude), lng: round(field.longitude) }
  }
  if (field.coordinates?.length === 2) {
    return { lat: round(field.coordinates[1]), lng: round(field.coordinates[0]) }
  }
  return null
}

const clean = (s) => (typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : undefined)
const places = []
let seq = 0

function add(place) {
  if (!place.lat || !place.lng || !place.name) return
  places.push({ id: `p${++seq}`, ...place })
}

// --- Austin Public Health: WIC clinics, neighborhood centers, health clinics ---
for (const row of raw('aph')) {
  const c = coords(row.street_address)
  const addr = humanAddress(row.street_address)
  const type = row.occupancy_type ?? ''
  const name = clean(row.facility_name) ?? ''
  let kind = null
  if (/WIC/i.test(name)) kind = 'wic'
  else if (/Neighborhood Center|Neighborhood Services/i.test(type)) kind = 'neighborhood-center'
  else if (/Clinic/i.test(type)) kind = 'clinic'
  if (!kind || !c) continue
  add({
    name,
    kind,
    address: clean(addr.address),
    zip: clean(row.zip_code) ?? clean(addr.zip),
    phone: clean(row.phone_number),
    hours: clean(row.hours),
    ...c,
  })
}

// --- Public libraries (free computers + wifi for online applications) ---
for (const row of raw('lib')) {
  const c = coords(row.address)
  const addr = humanAddress(row.address)
  if (!c) continue
  const computers = Number(row.computers ?? 0)
  add({
    name: clean(row.name),
    kind: 'library',
    address: clean(addr.address),
    zip: clean(addr.zip),
    phone: clean(row.phone),
    computers: Number.isFinite(computers) && computers > 0 ? computers : undefined,
    wifi: row.wifi === 'Yes',
    ...c,
  })
}

// --- Recreation centers ---
for (const row of raw('rec')) {
  const c = coords(row.location_1)
  if (!c) continue
  add({
    name: clean(row.recreation_centers),
    kind: 'rec-center',
    address: clean(row.address),
    zip: clean(row.zip_code),
    phone: clean(row.phone_number),
    url: clean(row.website),
    ...c,
  })
}

// --- Senior activity centers ---
for (const row of raw('senior')) {
  const c = coords(row.location1)
  if (!c) continue
  add({
    name: clean(row.recreation_centers),
    kind: 'senior-center',
    address: clean(row.address),
    zip: clean(row.zip_code),
    phone: clean(row.phone),
    ...c,
  })
}

// --- Safety-net health clinics (FQHCs only — sliding scale / uninsured friendly) ---
for (const row of raw('clinics')) {
  if (row.license_type !== 'FQHC') continue
  const c = coords(row.geocoded_column)
  if (!c) continue
  add({
    name: clean(row.name),
    kind: 'clinic',
    address: clean(row.address_1),
    zip: clean(row.zip),
    ...c,
  })
}

// --- Social service nonprofits (APH contracted vendors) ---
for (const row of raw('vendors')) {
  const c = coords(row.location_1)
  if (!c) continue
  add({
    name: clean(row.agency_name),
    kind: 'nonprofit',
    address: clean(row.location_address),
    zip: clean(row.location_zip),
    phone: clean(row.main_phone),
    url: clean(row.website?.url),
    ...c,
  })
}

// --- Public pools = Austin's free cooling infrastructure in extreme heat ---
for (const row of raw('pools')) {
  if (row.status !== 'Open') continue
  const c = coords(row.location_1)
  const addr = humanAddress(row.location_1)
  if (!c) continue
  const hours = [row.weekday && `Mon-Fri ${row.weekday}`, row.weekend && `Sat-Sun ${row.weekend}`]
    .filter(Boolean)
    .join(' · ')
  add({
    name: `${clean(row.pool_name)} Pool`,
    kind: 'cooling',
    address: clean(addr.address),
    phone: clean(row.phone),
    url: clean(row.website?.url),
    hours: hours || undefined,
    ...c,
  })
}

// De-duplicate places that share a building (e.g. clinic + neighborhood center)
const seen = new Set()
const deduped = places.filter((p) => {
  const key = `${p.kind}|${p.name.toLowerCase()}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

// --- Affordable housing (income-restricted, completed projects) ---
const housing = raw('housing')
  .filter((row) => row.latitude && row.longitude && Number(row.affordable_units) > 0)
  .map((row) => ({
    name: clean(row.project_name),
    address: clean(row.address),
    zip: clean(row.zip),
    district: clean(row.council_district),
    affordable: Number(row.affordable_units) || 0,
    total: Number(row.total_units) || 0,
    // Units reserved for households at 30% / 50% / 60% of Median Family Income
    mfi30: Number(row.mfi_30) || 0,
    mfi50: Number(row.mfi_50) || 0,
    mfi60: Number(row.mfi_60) || 0,
    supportive: Number(row.psh_units) || 0,
    lat: round(row.latitude),
    lng: round(row.longitude),
  }))
  .sort((a, b) => b.affordable - a.affordable)

// --- Equity context from the Levers of Economic Mobility Index (Austin tracts) ---
const tracts = raw('lemi').filter((row) => Number(row.pct_in_austin) > 50)
const numbers = (key) =>
  tracts.map((row) => Number(row[key])).filter((value) => Number.isFinite(value))
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

const equity = {
  tractCount: tracts.length,
  povertyMedian: Math.round(median(numbers('poverty_pct')) * 10) / 10,
  povertyMax: Math.round(Math.max(...numbers('poverty_pct')) * 10) / 10,
  uninsuredMedian: Math.round(median(numbers('uninsured_pct')) * 10) / 10,
  uninsuredMax: Math.round(Math.max(...numbers('uninsured_pct')) * 10) / 10,
  noInternetMax: Math.round(Math.max(...numbers('no_internet_pct')) * 10) / 10,
  limitedEnglishMax: Math.round(Math.max(...numbers('lesh_pct')) * 10) / 10,
  highPovertyTracts: numbers('poverty_pct').filter((value) => value >= 20).length,
}

const header = `// GENERATED FILE — do not edit by hand.
// Source: City of Austin Open Data Portal (data.austintexas.gov), Socrata API.
// Regenerate with: node scripts/build-places.mjs
// Snapshot taken: ${new Date().toISOString().slice(0, 10)}
`

writeFileSync(
  resolve(root, 'src/data/places.ts'),
  `${header}import type { Place } from '../types'

export const places: Place[] = ${JSON.stringify(deduped, null, 0)}
`,
)

writeFileSync(
  resolve(root, 'src/data/housing.ts'),
  `${header}import type { HousingProject } from '../types'

export const housingProjects: HousingProject[] = ${JSON.stringify(housing, null, 0)}
`,
)

writeFileSync(
  resolve(root, 'src/data/equity.ts'),
  `${header}export const equity = ${JSON.stringify(equity, null, 2)} as const
`,
)

const counts = deduped.reduce((acc, p) => ({ ...acc, [p.kind]: (acc[p.kind] ?? 0) + 1 }), {})
console.log('places:', deduped.length, counts)
console.log('housing projects:', housing.length)
console.log('equity:', equity)
