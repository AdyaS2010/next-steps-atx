import { describe, expect, it } from 'vitest'
import {
  AUSTIN_CENTER,
  centerForZip,
  distanceMiles,
  formatDistance,
  sortByDistance,
} from './geo'

describe('geo helpers', () => {
  it('returns zero distance for the same point', () => {
    expect(distanceMiles(AUSTIN_CENTER, AUSTIN_CENTER)).toBeCloseTo(0, 5)
  })

  it('measures a known Austin distance', () => {
    // Downtown (78701) to Montopolis (78741) is roughly 3.5 miles
    const montopolis = { lat: 30.2287, lng: -97.7196 }
    const miles = distanceMiles(AUSTIN_CENTER, montopolis)
    expect(miles).toBeGreaterThan(2)
    expect(miles).toBeLessThan(5)
  })

  it('is symmetric', () => {
    const a = { lat: 30.3, lng: -97.7 }
    const b = { lat: 30.4, lng: -97.8 }
    expect(distanceMiles(a, b)).toBeCloseTo(distanceMiles(b, a), 6)
  })

  it('sorts places nearest first', () => {
    const origin = { lat: 30.2672, lng: -97.7431 }
    const sorted = sortByDistance(
      [
        { id: 'far', lat: 30.45, lng: -97.8 },
        { id: 'near', lat: 30.27, lng: -97.745 },
        { id: 'mid', lat: 30.33, lng: -97.75 },
      ],
      origin,
    )
    expect(sorted.map((s) => s.id)).toEqual(['near', 'mid', 'far'])
    expect(sorted[0].distance).toBeLessThan(sorted[1].distance)
  })

  it('formats distances for humans', () => {
    expect(formatDistance(0.05, 'en')).toBe('Very close')
    expect(formatDistance(0.05, 'es')).toBe('Muy cerca')
    expect(formatDistance(2.34, 'en')).toBe('2.3 mi')
    expect(formatDistance(12.6, 'en')).toBe('13 mi')
  })

  it('resolves known Austin ZIP codes', () => {
    expect(centerForZip('78704')).not.toBeNull()
    expect(centerForZip(' 78702 ')).not.toBeNull()
    expect(centerForZip('90210')).toBeNull()
  })
})
