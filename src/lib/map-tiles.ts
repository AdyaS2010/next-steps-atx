import { TileLayer, type Coords, type DoneCallback, type Map as LeafletMap } from 'leaflet'

export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export async function fetchMapTile(url: string, signal: AbortSignal): Promise<Blob> {
  const response = await fetch(url, {
    signal,
    mode: 'cors',
    credentials: 'omit',
    referrerPolicy: 'origin',
    cache: 'default',
    redirect: 'error',
  })
  // Providers can return an error as a valid PNG. Check HTTP status before
  // decoding so a block notice never becomes the background map.
  if (!response.ok) throw new Error(`Map tiles unavailable (${response.status})`)
  if (!response.headers.get('content-type')?.toLowerCase().startsWith('image/')) {
    throw new Error('The map provider did not return an image')
  }
  return response.blob()
}

type PendingTile = {
  controller: AbortController
  timer: ReturnType<typeof setTimeout>
  objectUrl?: string
}

export class CheckedTileLayer extends TileLayer {
  private requests = new Map<HTMLImageElement, PendingTile>()

  constructor() {
    super(OSM_TILE_URL, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      updateWhenIdle: true,
      keepBuffer: 1,
    })
    this.on('tileunload', event => {
      if (event.tile instanceof HTMLImageElement) this.release(event.tile)
    })
  }

  private release(tile: HTMLImageElement) {
    const request = this.requests.get(tile)
    if (!request) return
    this.requests.delete(tile)
    clearTimeout(request.timer)
    request.controller.abort()
    tile.onload = null
    tile.onerror = null
    if (request.objectUrl) URL.revokeObjectURL(request.objectUrl)
  }

  override createTile(coords: Coords, done: DoneCallback): HTMLElement {
    const tile = document.createElement('img')
    tile.alt = ''
    tile.setAttribute('role', 'presentation')
    const controller = new AbortController()
    const request: PendingTile = {
      controller,
      timer: setTimeout(() => controller.abort(), 10000),
    }
    this.requests.set(tile, request)
    void fetchMapTile(this.getTileUrl(coords), controller.signal).then(blob => {
      if (!this.requests.has(tile)) return
      request.objectUrl = URL.createObjectURL(blob)
      tile.onload = () => {
        this.release(tile)
        done(undefined, tile)
      }
      tile.onerror = () => {
        this.release(tile)
        done(new Error('The map image could not be decoded'), tile)
      }
      tile.src = request.objectUrl
    }).catch(error => {
      if (!this.requests.has(tile)) return
      this.release(tile)
      done(error instanceof Error ? error : new Error('Map tiles unavailable'), tile)
    })
    return tile
  }

  override onRemove(map: LeafletMap): this {
    for (const tile of this.requests.keys()) this.release(tile)
    return super.onRemove(map)
  }
}
