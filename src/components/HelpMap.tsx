import { useCallback, useEffect, useState } from 'react'
import { control } from 'leaflet'
import { CircleMarker, MapContainer, Popup, Tooltip, useMap } from 'react-leaflet'
import type { Coordinates, Language } from '../types'
import { createTranslator } from '../lib/i18n'
import { CheckedTileLayer } from '../lib/map-tiles'

export type HelpMarker = {
  id: string
  lat: number
  lng: number
  color: string
  title: string
  detail: string
  isHousing?: boolean
}

type HelpMapProps = {
  markers: HelpMarker[]
  origin: Coordinates | null
  ariaLabel: string
  language: Language
}

function Recenter({ origin }: { origin: Coordinates | null }) {
  const map = useMap()
  useEffect(() => {
    if (origin) map.setView([origin.lat, origin.lng], 13, { animate: false })
  }, [map, origin])
  return null
}

function MapControls({ language }: { language: Language }) {
  const map = useMap()
  useEffect(() => {
    const t = createTranslator(language)
    const zoom = control.zoom({ zoomInTitle: t('zoomIn'), zoomOutTitle: t('zoomOut') })
    zoom.addTo(map)
    const translatePopup = () => {
      const close = map.getContainer().querySelector<HTMLElement>('.leaflet-popup-close-button')
      close?.setAttribute('aria-label', t('close'))
      close?.setAttribute('title', t('close'))
    }
    translatePopup()
    map.on('popupopen', translatePopup)
    return () => { zoom.remove(); map.off('popupopen', translatePopup) }
  }, [map, language])
  return null
}

function MapTiles({ onFailure }: { onFailure: () => void }) {
  const map = useMap()
  useEffect(() => {
    const layer = new CheckedTileLayer()
    layer.on('tileerror', onFailure)
    layer.addTo(map)
    return () => { layer.off('tileerror', onFailure); layer.remove() }
  }, [map, onFailure])
  return null
}

export default function HelpMap({ markers, origin, ariaLabel, language }: HelpMapProps) {
  const [failed, setFailed] = useState(false)
  const onFailure = useCallback(() => setFailed(true), [])
  const t = createTranslator(language)
  if (failed) return <section aria-label={ariaLabel} className="notice">
    <p role="status">{t('mapFailed')}</p>
    <button type="button" onClick={() => setFailed(false)}>{t('retryMap')}</button>
  </section>
  return (
    <section aria-label={ariaLabel}>
    <MapContainer
      center={[30.28, -97.74]}
      zoom={11}
      scrollWheelZoom={false}
      zoomControl={false}
      className="help-map"
      aria-label={ariaLabel}
    >
      <MapTiles onFailure={onFailure} />
      <Recenter origin={origin} />
      <MapControls language={language} />

      {origin && (
        <CircleMarker
          center={[origin.lat, origin.lng]}
          radius={9}
          pathOptions={{
            color: 'var(--cp-surface)',
            weight: 3,
            fillColor: 'var(--cp-accent)',
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top">{t('mapYou')}</Tooltip>
        </CircleMarker>
      )}

      {markers.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={marker.isHousing ? 6 : 9}
          pathOptions={{
            color: 'var(--cp-panel-strong)',
            weight: 2,
            fillColor: marker.color,
            fillOpacity: 0.85,
          }}
        >
          <Tooltip direction="top">{marker.title}</Tooltip>
          <Popup>
            <strong>{marker.title}</strong>
            <span>{marker.detail}</span>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
    </section>
  )
}
