import { Component, lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import { MapPin } from 'lucide-react'
import { places } from '../data/places'
import { housingProjects } from '../data/housing'
import { datasetSources, placeLabels, placeOrder, placeWhy, services311 } from '../data/places-meta'
import { centerForZip, formatDistance, sortByDistance } from '../lib/geo'
import { normalize, toTelHref } from '../lib/format'
import { createTranslator } from '../lib/i18n'
import type { Coordinates, Language, PlaceKind } from '../types'

const HelpMap = lazy(() => import('./HelpMap'))

class MapFallback extends Component<{ children: ReactNode; message: string }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <p role="status">{this.props.message}</p> : this.props.children }
}

export function DataSources({ language, kind }: { language: Language; kind?: string }) {
  const t = createTranslator(language)
  return <ul className="source-list">
    {datasetSources.filter(source => !kind || (source.kinds as readonly string[]).includes(kind)).map(source =>
      <li key={source.id}>
        <a href={`https://data.austintexas.gov/d/${source.id}`} target="_blank" rel="noreferrer">{source.title[language]}</a>
        <span>{t('snapshot')}: <time dateTime={source.snapshot}>{source.snapshot}</time></span>
        <span>{language === 'en' ? 'Recorded publication' : 'Publicación registrada'}: {source.published}</span>
      </li>)}
  </ul>
}

export default function NearbyHelp({ language, initialZip, initialKinds = [] }: {
  language: Language
  initialZip?: string | null
  initialKinds?: PlaceKind[]
}) {
  const t = createTranslator(language)
  const [zip, setZip] = useState(initialZip ?? '')
  const [origin, setOrigin] = useState<Coordinates | null>(() => initialZip ? centerForZip(initialZip) : null)
  const [kind, setKind] = useState<PlaceKind | 'all'>(initialKinds[0] ?? 'all')
  const [limit, setLimit] = useState(5)
  const [map, setMap] = useState(false)
  const [locationError, setLocationError] = useState<'zipInvalid' | 'zipUnavailable' | 'locationError' | null>(null)
  const [locating, setLocating] = useState(false)
  const [housingSearch, setHousingSearch] = useState('')
  const [housingLimit, setHousingLimit] = useState(5)
  const filtered = useMemo(() => {
    const list = places.filter(place => kind === 'all' || place.kind === kind)
    return origin ? sortByDistance(list, origin) : list.sort((a, b) => a.name.localeCompare(b.name)).map(place => ({ ...place, distance: null }))
  }, [kind, origin])
  const housing = useMemo(() => {
    const query = normalize(housingSearch)
    return housingProjects.filter(project => normalize(`${project.name} ${project.address ?? ''} ${project.zip ?? ''}`).includes(query))
  }, [housingSearch])
  const locate = () => {
    setLocationError(null)
    if (!navigator.geolocation) { setLocationError('locationError'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(position => {
      setOrigin({ lat: position.coords.latitude, lng: position.coords.longitude })
      setLocating(false); setLimit(5)
    }, () => { setLocationError('locationError'); setLocating(false) },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 })
  }
  return <section className="nearby-page">
    <h1>{t('nearHeading')}</h1><p>{t('nearIntro')}</p>
    <div className="panel nearby-tools">
      <form onSubmit={event => {
        event.preventDefault()
        if (!/^\d{5}$/.test(zip)) { setLocationError('zipInvalid'); return }
        const center = centerForZip(zip)
        setOrigin(center); setLocationError(center ? null : 'zipUnavailable'); setLimit(5)
      }}>
        <label htmlFor="near-zip">{t('zip')}</label>
        <div className="inline-field"><input id="near-zip" inputMode="numeric" maxLength={5} value={zip} onChange={event => setZip(event.target.value)} />
          <button type="submit">{t('useZip')}</button></div>
      </form>
      <p className="hint">{t('locationDisclosure')}</p>
      <div className="button-row"><button onClick={locate} disabled={locating}><MapPin size={18} aria-hidden="true" />{t(locating ? 'loading' : 'useLocation')}</button>
        {origin && <button onClick={() => { setOrigin(null); setZip(''); setMap(false) }}>{t('clearLocation')}</button>}</div>
      {locationError && <p role="status" className="notice">{t(locationError)}</p>}
      <div className="field"><label htmlFor="place-kind">{t('placeFilter')}</label>
        <select id="place-kind" value={kind} onChange={event => { setKind(event.target.value as PlaceKind | 'all'); setLimit(5) }}>
          <option value="all">{t('allPlaces')}</option>{placeOrder.map(value => <option key={value} value={value}>{placeLabels[value][language]}</option>)}
        </select>
      </div>
    </div>
    <aside className="notice dataset-notice" aria-label={t('sources')}>
      <p>{t('historicPlaces')}</p>
      <details><summary>{t('sources')}</summary><DataSources language={language} kind={kind === 'all' ? undefined : kind} /></details>
    </aside>
    <p className="hint">{t(origin ? 'approximate' : 'alphabetical')}</p>
    <div className="map-choice">
      <button aria-expanded={map} onClick={() => setMap(value => !value)}>{t(map ? 'hideMap' : 'showMap')}</button>
      <p className="hint">{t('mapPrivacy')}</p>
    </div>
    {map && <MapFallback message={t('mapFailed')}><Suspense fallback={<p role="status">{t('loading')}</p>}>
      <HelpMap language={language} origin={origin} ariaLabel={t('mapLabel')} markers={filtered.slice(0, limit).map(place => ({
        id: place.id, lat: place.lat, lng: place.lng, color: 'var(--cp-accent)', title: place.name, detail: place.address ?? '',
      }))} />
    </Suspense></MapFallback>}
    <div className="place-list" aria-label={t('nearHeading')}>
      {filtered.slice(0, limit).map(place => <article className="place-card" key={place.id}>
        <p className="eyebrow">{placeLabels[place.kind][language]}{place.distance !== null && ` · ${formatDistance(place.distance, language)}`}</p>
        <h2>{place.name}</h2><p>{place.address}{place.zip && `, ${place.zip}`}</p>
        <p>{placeWhy[place.kind][language]}</p>
        <div className="button-row">
          {place.phone && <a className="button" href={toTelHref(place.phone)}>{t('call')} {place.phone}</a>}
          {place.url && <a className="button" href={place.url} target="_blank" rel="noreferrer">{t('website')}</a>}
          <a className="button" href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`} target="_blank" rel="noreferrer">{t('directions')}</a>
        </div>
        <details><summary>{t('placeDetails')}</summary>
          <p>{t('callAhead')}</p>
          {place.hours ? <><h3>{t('hours')}</h3><p lang="en">{place.hours.replace(/â/g, '–')}</p></> : <p>{t('noHours')}</p>}
          <p>{t('accessUnknown')}</p><DataSources language={language} kind={place.kind} />
        </details>
      </article>)}
    </div>
    {filtered.length > limit && <button className="show-more" onClick={() => setLimit(value => value + 5)}>{t('showMore')} ({filtered.length - limit})</button>}
    <section className="separate-section">
      <h2>{t('housingHeading')}</h2><p>{t('housingIntro')}</p>
      <p className="hint">{t('snapshot')}: <time dateTime="2026-07-25">2026-07-25</time></p>
      <p><a href="https://www.austintexas.gov/housing/programs/affordable-housing-online-search-tool-ahost" target="_blank" rel="noreferrer">{t('housingFinder')}</a></p>
      <details><summary>{t('housingHeading')}</summary>
        <div className="field"><label htmlFor="housing-search">{t('housingSearch')}</label><input id="housing-search" type="search" value={housingSearch} onChange={event => { setHousingSearch(event.target.value); setHousingLimit(5) }} /></div>
        {housing.slice(0, housingLimit).map((project, index) => <article className="place-card" key={`${project.name}-${index}`}>
          <h3>{project.name}</h3><p>{project.address} {project.zip}</p>
          <p><strong>{project.affordable}</strong> {t('inventoryUnits')}</p>
          <p className="hint">{t('housingContactUnknown')}</p>
          <details><summary>{t('incomeBands')}</summary>
            <p>{language === 'en' ? 'MFI means median family income. These are recorded unit counts, not current vacancies or your household’s income limit.' : 'MFI significa ingreso familiar mediano. Son cantidades registradas de unidades, no vacantes actuales ni el límite de ingreso de su hogar.'}</p>
            <p>30% MFI: {project.mfi30} · 50% MFI: {project.mfi50} · 60% MFI: {project.mfi60}</p>
            <p>{t('supportive')}: {project.supportive}</p><p>{t('accessUnknown')}</p>
          </details>
        </article>)}
        {housing.length > housingLimit && <button onClick={() => setHousingLimit(value => value + 5)}>{t('showMore')} ({housing.length - housingLimit})</button>}
        <DataSources language={language} kind="housing" />
      </details>
    </section>
    <section className="separate-section"><h2>{t('cityServices')}</h2><p>{t('cityIntro')}</p>
      <div className="button-row"><a className="button" href="tel:311">{t('call')} 3-1-1</a><a className="button" href="tel:+15129742000">512-974-2000</a>
        <a className="button" href="https://311.austintexas.gov/" target="_blank" rel="noreferrer">{t('cityOnline')}</a></div>
      {services311.map(service => <details key={service.id}><summary>{service.title[language]}</summary><p>{service.body[language]}</p></details>)}
    </section>
  </section>
}
