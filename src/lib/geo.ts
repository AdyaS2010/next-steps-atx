import type { Coordinates } from '../types'

/** Approximate center of downtown Austin — fallback when no location is shared. */
export const AUSTIN_CENTER: Coordinates = { lat: 30.2672, lng: -97.7431 }

const EARTH_RADIUS_MI = 3958.8
const toRad = (deg: number) => (deg * Math.PI) / 180

/** Great-circle distance in miles between two points. */
export function distanceMiles(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function formatDistance(miles: number, language: 'en' | 'es'): string {
  if (miles < 0.1) return language === 'en' ? 'Very close' : 'Muy cerca'
  if (miles < 10) return `${miles.toFixed(1)} mi`
  return `${Math.round(miles)} mi`
}

/** Sort items by distance from an origin, nearest first. */
export function sortByDistance<T extends Coordinates>(
  items: T[],
  origin: Coordinates,
): Array<T & { distance: number }> {
  return items
    .map((item) => ({ ...item, distance: distanceMiles(origin, item) }))
    .sort((a, b) => a.distance - b.distance)
}

/** Centroid of Austin ZIP codes, used when someone types a ZIP instead of sharing location. */
export const zipCenters: Record<string, Coordinates> = {
  '78701': { lat: 30.2711, lng: -97.7437 },
  '78702': { lat: 30.2626, lng: -97.7143 },
  '78703': { lat: 30.2915, lng: -97.7644 },
  '78704': { lat: 30.2432, lng: -97.7659 },
  '78705': { lat: 30.2924, lng: -97.7411 },
  '78717': { lat: 30.4938, lng: -97.7594 },
  '78719': { lat: 30.1424, lng: -97.6689 },
  '78721': { lat: 30.2686, lng: -97.6862 },
  '78722': { lat: 30.2887, lng: -97.7156 },
  '78723': { lat: 30.3053, lng: -97.6863 },
  '78724': { lat: 30.2957, lng: -97.6191 },
  '78725': { lat: 30.2338, lng: -97.6119 },
  '78726': { lat: 30.4353, lng: -97.8404 },
  '78727': { lat: 30.4262, lng: -97.7139 },
  '78728': { lat: 30.4468, lng: -97.6866 },
  '78729': { lat: 30.4552, lng: -97.7683 },
  '78730': { lat: 30.3651, lng: -97.8299 },
  '78731': { lat: 30.3448, lng: -97.7665 },
  '78732': { lat: 30.3771, lng: -97.8887 },
  '78733': { lat: 30.3247, lng: -97.8709 },
  '78734': { lat: 30.3775, lng: -97.9484 },
  '78735': { lat: 30.2596, lng: -97.8558 },
  '78736': { lat: 30.2382, lng: -97.9316 },
  '78737': { lat: 30.1899, lng: -97.9481 },
  '78738': { lat: 30.3195, lng: -97.9781 },
  '78739': { lat: 30.1793, lng: -97.8858 },
  '78741': { lat: 30.2287, lng: -97.7196 },
  '78742': { lat: 30.2359, lng: -97.6584 },
  '78744': { lat: 30.1846, lng: -97.7412 },
  '78745': { lat: 30.2062, lng: -97.7982 },
  '78746': { lat: 30.2856, lng: -97.8073 },
  '78747': { lat: 30.1354, lng: -97.7386 },
  '78748': { lat: 30.1662, lng: -97.8237 },
  '78749': { lat: 30.2101, lng: -97.8534 },
  '78750': { lat: 30.4239, lng: -97.7976 },
  '78751': { lat: 30.3103, lng: -97.7245 },
  '78752': { lat: 30.3315, lng: -97.7016 },
  '78753': { lat: 30.3746, lng: -97.6845 },
  '78754': { lat: 30.3506, lng: -97.6603 },
  '78756': { lat: 30.3216, lng: -97.7395 },
  '78757': { lat: 30.3512, lng: -97.7311 },
  '78758': { lat: 30.3873, lng: -97.7096 },
  '78759': { lat: 30.4033, lng: -97.7538 },
}

/** Resolve a 5-digit Austin ZIP to an approximate center. */
export function centerForZip(zip: string): Coordinates | null {
  return zipCenters[zip.trim()] ?? null
}
