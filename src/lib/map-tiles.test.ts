import { afterEach, describe, expect, it, vi } from 'vitest'
import { CheckedTileLayer, fetchMapTile, OSM_TILE_URL } from './map-tiles'
import { point, type Coords } from 'leaflet'

afterEach(() => vi.unstubAllGlobals())

describe('policy-compliant map tiles', () => {
  it('uses the canonical URL, real origin-only referrer and normal HTTP caching', async () => {
    const request = vi.fn().mockResolvedValue(new Response('tile bytes', { headers: { 'Content-Type': 'image/png' } }))
    vi.stubGlobal('fetch', request)
    expect(OSM_TILE_URL).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    const signal = new AbortController().signal
    await fetchMapTile('https://tile.openstreetmap.org/11/467/843.png', signal)
    expect(request).toHaveBeenCalledWith('https://tile.openstreetmap.org/11/467/843.png', {
      signal, referrerPolicy: 'origin', mode: 'cors', credentials: 'omit',
      cache: 'default', redirect: 'error',
    })
  })
  it('rejects a blocked response even when its body is a displayable image', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('blocked image bytes', { status: 403, headers: { 'Content-Type': 'image/png' } })))
    await expect(fetchMapTile('https://tile.openstreetmap.org/11/467/843.png', new AbortController().signal)).rejects.toThrow('403')
  })
  it('rejects unexpected HTML and does not retry automatically', async () => {
    const request = vi.fn().mockResolvedValue(new Response('<html>Unavailable</html>', { headers: { 'Content-Type': 'text/html' } }))
    vi.stubGlobal('fetch', request)
    await expect(fetchMapTile('https://tile.openstreetmap.org/11/467/843.png', new AbortController().signal)).rejects.toThrow('image')
    expect(request).toHaveBeenCalledOnce()
  })
  it('cancels an unloaded tile without reporting an error or making another request', async () => {
    let aborted = false
    const request = vi.fn().mockImplementation((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => { aborted = true; reject(new DOMException('Aborted', 'AbortError')) })
    }))
    vi.stubGlobal('fetch', request)
    const layer = new CheckedTileLayer()
    const coords: Coords = Object.assign(point(467, 843), { z: 11 })
    const done = vi.fn()
    const tile = layer.createTile(coords, done)
    layer.fire('tileunload', { tile })
    await Promise.resolve()
    expect(aborted).toBe(true)
    expect(done).not.toHaveBeenCalled()
    expect(request).toHaveBeenCalledOnce()
  })
})
