import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Briefcase, CheckSquare, HandHeart, MapPin, Menu, Moon, Phone, Search, ShieldCheck, Sun, Wallet } from 'lucide-react'
import './App.css'
import { programs } from './data/programs'
import { places } from './data/places'
import { categoryLabels, categoryOrder } from './data/facts'
import { createTranslator } from './lib/i18n'
import { normalize } from './lib/format'
import { emptyHousehold, rankRecommendations } from './lib/eligibility'
import { householdFromSignal, interpretSituation, MAX_SITUATION_LENGTH, type NavigatorSignal } from './lib/navigator'
import { useSteps } from './lib/steps'
import NeedButtons from './components/NeedButtons'
import HouseholdFlow from './components/HouseholdFlow'
import NearbyHelp, { DataSources } from './components/NearbyHelp'
import { MySteps, ProgramCard, ProgramDetail } from './components/ProgramViews'
import VoiceInput from './components/VoiceInput'
import UrgentHelp from './components/UrgentHelp'
import { AiAssist } from './components/AiAssist'
import { CommonTerms } from './components/CommonTerms'
import { PathwayFacts, PathwayGrid, PathwayView, QuickExit } from './components/Pathways'
import { ActionPlan } from './components/ActionPlan'
import { MoneyCheck } from './components/MoneyCheck'
import { CareerBuilder } from './components/CareerBuilder'
import { buildActionPlan } from './lib/plan'
import { getAiStatus } from './lib/ai'
import { pathways, type Pathway } from './data/pathways'
import type { BenefitCategory, Household, Language } from './types'

type View = 'find' | 'confirm' | 'guided' | 'results' | 'nearby' | 'steps' | 'more' | 'directory' | 'about' | 'urgent' | 'pathway' | 'money' | 'career'
type Route = { view: View; programId: string | null }
const views: View[] = ['find', 'confirm', 'guided', 'results', 'nearby', 'steps', 'more', 'directory', 'about', 'urgent', 'pathway', 'money', 'career']

function readRoute(): Route {
  const [view, marker, id] = window.location.hash.slice(1).split('/')
  return {
    view: views.includes(view as View) ? view as View : 'find',
    programId: marker === 'program' && programs.some(program => program.id === id) ? id : null,
  }
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en')
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const [route, setRoute] = useState<Route>(readRoute)
  const [text, setText] = useState('')
  const [household, setHousehold] = useState<Household>(emptyHousehold)
  const [signal, setSignal] = useState<NavigatorSignal | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [flowRevision, setFlowRevision] = useState(0)
  const [resultLimit, setResultLimit] = useState(3)
  const [directoryLimit, setDirectoryLimit] = useState(10)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<BenefitCategory | 'all'>('all')
  const [pathwayId, setPathwayId] = useState<string | null>(null)
  const [resultsTab, setResultsTab] = useState<'plan' | 'list'>('plan')
  const [confirmReset, setConfirmReset] = useState(false)
  const main = useRef<HTMLElement>(null)
  const [opener, setOpener] = useState<HTMLElement | null>(null)
  const steps = useSteps()
  const t = createTranslator(language)

  // The optional AI entry point appears only when a provider is actually connected.
  const [aiAvailable, setAiAvailable] = useState(false)
  useEffect(() => { let live = true; void getAiStatus().then(status => { if (live) setAiAvailable(status.available) }); return () => { live = false } }, [])
  useEffect(() => { document.documentElement.lang = language }, [language])
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  useEffect(() => {
    const sync = () => setRoute(readRoute())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync) }
  }, [])
  useEffect(() => {
    const heading = main.current?.querySelector<HTMLElement>('h1')
    if (heading) { heading.tabIndex = -1; heading.focus() }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route.view])
  const go = useCallback((view: View, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', `#${view}`)
    setRoute({ view, programId: null })
  }, [])
  const openProgram = (programId: string) => {
    setOpener(document.activeElement as HTMLElement)
    window.history.pushState({ benefitsModal: true }, '', `#${route.view}/program/${programId}`)
    setRoute({ ...route, programId })
  }
  const closeProgram = () => {
    if (window.history.state?.benefitsModal) window.history.back()
    else go(route.view, true)
  }
  const reset = () => {
    setConfirmReset(false)
    setText(''); setHousehold(emptyHousehold()); setSignal(null); setConfirmed(false)
    setSearch(''); setCategory('all'); setResultLimit(3); setDirectoryLimit(10)
    setPathwayId(null); setResultsTab('plan')
    setFlowRevision(value => value + 1); go('find', true)
  }
  const run = (needs?: BenefitCategory[]) => {
    if (!text.trim()) return
    const interpreted = interpretSituation(text, language)
    if (needs && !interpreted.emergency) interpreted.categories = needs
    setSignal(interpreted); setHousehold(householdFromSignal(interpreted)); setConfirmed(false)
    setResultLimit(3); setFlowRevision(value => value + 1); setPathwayId(null); setResultsTab('plan')
    setText('')
    go(interpreted.emergency ? 'urgent' : 'confirm')
  }
  const startGuided = (need?: BenefitCategory | BenefitCategory[]) => {
    const fresh = emptyHousehold()
    if (need) fresh.needs = Array.isArray(need) ? need : [need]
    setText(''); setHousehold(fresh); setSignal(null); setConfirmed(false); setPathwayId(null); setResultsTab('plan')
    setFlowRevision(value => value + 1); go('guided')
  }
  const openPathway = (id: string) => { setPathwayId(id); go('pathway') }
  // Pathway details are suggestions; the confirmation step still asks the person to check them.
  const startPathway = (pathway: Pathway) => {
    const fresh = emptyHousehold()
    fresh.needs = [...pathway.needs]
    for (const flag of pathway.flags) fresh[flag] = true
    setSignal({ flags: [...pathway.flags], deniedFlags: [], categories: [...pathway.needs], placeKinds: [], wantsNearby: false, size: null, monthlyIncome: null, zip: null, emergency: null, warnings: [] })
    setText(''); setHousehold(fresh); setConfirmed(false); setResultLimit(3); setResultsTab('plan')
    setPathwayId(pathway.id); setFlowRevision(value => value + 1); go('confirm')
  }
  const recommendations = useMemo(() => confirmed ? rankRecommendations(programs, household) : [], [confirmed, household])
  const plan = useMemo(() => buildActionPlan(recommendations, household), [recommendations, household])
  const activePathway = pathways.find(pathway => pathway.id === pathwayId)
  // A chosen pathway decides; otherwise any explicit safety need shows the quick exit.
  const showQuickExit = activePathway ? Boolean(activePathway.quickExit) : household.needs.includes('safety')
  const directory = useMemo(() => {
    const query = normalize(search)
    return programs.filter(program => (category === 'all' || program.category === category) &&
      normalize(`${program.name} ${program.agency} ${program.provides[language]} ${program.eligibilitySummary[language]}`).includes(query))
  }, [search, category, language])
  const selected = programs.find(program => program.id === route.programId)
  const activeNav = ['confirm', 'guided', 'results', 'urgent', 'pathway', 'money'].includes(route.view) ? 'find' :
    ['directory', 'about'].includes(route.view) ? 'more' : route.view
  const nav = [
    { view: 'find' as const, label: 'find' as const, icon: Search },
    { view: 'career' as const, label: 'career' as const, icon: Briefcase },
    { view: 'nearby' as const, label: 'nearby' as const, icon: MapPin },
    { view: 'steps' as const, label: 'mySteps' as const, icon: CheckSquare },
    { view: 'more' as const, label: 'more' as const, icon: Menu },
  ]
  return <>
    <div className="app-shell" inert={Boolean(selected)}>
      <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); main.current?.focus() }}>{t('skip')}</a>
      {showQuickExit && route.view !== 'pathway' && <div className="quick-exit-float"><QuickExit language={language} /></div>}
      <header className="site-header">
        <button className="brand" onClick={() => go('find')} aria-label={`${t('appName')}: ${t('appSubtitle')}`}>
          <HandHeart aria-hidden="true" size={28} /><span className="brand-text"><span className="brand-name">{t('appName')}</span><span className="brand-sub">{t('appSubtitle')}</span></span>
        </button>
        <div className="header-actions">
          <button className="language-button" lang={language === 'en' ? 'es' : 'en'} onClick={() => setLanguage(value => value === 'en' ? 'es' : 'en')}>{language === 'en' ? 'Español' : 'English'}</button>
          <button className="theme-button" aria-label={t(theme === 'light' ? 'dark' : 'light')} onClick={() => setTheme(value => value === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
          </button>
        </div>
      </header>
      <nav className="primary-nav" aria-label={t('primaryNav')}>
        {nav.map(item => <button key={item.view} aria-current={activeNav === item.view ? 'page' : undefined} onClick={() => go(item.view)}>
          <item.icon size={21} aria-hidden="true" /><span>{t(item.label)}</span>
        </button>)}
      </nav>
      <main ref={main} id="main" tabIndex={-1} className={route.view === 'find' ? 'landing-main' : undefined}>
        {route.view === 'find' && <section className="home-view">
          <section className="home-hero" aria-labelledby="home-title">
            <picture className="hero-photo" aria-hidden="true">
              <source media="(max-width: 700px)" srcSet="/pennybacker-960.jpg" />
              <img src="/pennybacker-1920.jpg" alt="" width="1920" height="1280" fetchPriority="high" />
            </picture>
            <div className="hero-inner">
              <div className="home-intro"><p className="eyebrow">{t('homeLocation')}</p>
                <h1 id="home-title" tabIndex={-1}>{t('heading')}{' '}<span>{t('headingAccent')}</span></h1>
                <p>{t('intro')}</p>
              </div>
              <div className="ask-panel">
                <p className="ask-title">{t('homeFormTitle')}</p>
                <form onSubmit={event => { event.preventDefault(); run() }}>
                  <label htmlFor="situation">{t('situation')}</label>
                  <textarea id="situation" value={text} maxLength={MAX_SITUATION_LENGTH} rows={2} placeholder={t('placeholder')} onChange={event => setText(event.target.value)} aria-describedby="input-privacy" />
                  <button type="submit" className="primary main-cta" disabled={!text.trim()}>{t('review')}<ArrowRight size={19} aria-hidden="true" /></button>
                </form>
                <p className="privacy-line"><ShieldCheck size={16} aria-hidden="true" />{t('homeTrust')}</p>
                <details className="input-options"><summary>{language === 'en' ? 'Privacy & voice options' : 'Privacidad y opciones de voz'}</summary>
                  <p id="input-privacy">{t('private')} {t('privacyInput')}</p><VoiceInput language={language} onText={value => setText(value.slice(0, MAX_SITUATION_LENGTH))} />
                </details>
              </div>
            </div>
            <div className="photo-credit">
              <a href="https://commons.wikimedia.org/wiki/File:Pennybacker_Bridge_September_2018.jpg" target="_blank" rel="noreferrer">{t('photoCredit')}</a>
              <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">{t('photoLicense')}</a>
            </div>
          </section>
          <div className="landing-content">
            <section className="pathways-section" aria-labelledby="pathways-heading">
              <div className="section-heading"><div><p className="eyebrow">{t('pathwaysEyebrow')}</p><h2 id="pathways-heading">{t('pathwaysHeading')}</h2></div></div>
              <p className="section-description">{t('pathwaysIntro')}</p>
              <PathwayGrid language={language} onOpen={openPathway} limit={8} />
            </section>
            <section className="needs-section" aria-labelledby="needs-heading">
              <div className="section-heading"><div><p className="eyebrow">{t('chooseNeed')}</p><h2 id="needs-heading">{t('homeBrowse')}</h2></div>
                <button className="text-button" onClick={() => go('directory')}>{t('directory')}<ArrowRight size={18} aria-hidden="true" /></button></div>
              <p className="section-description">{t('homeBrowseIntro')}</p>
              <NeedButtons language={language} onChoose={startGuided} />
              <button className="text-button" onClick={() => startGuided()}>{t('guided')}<ArrowRight size={18} aria-hidden="true" /></button>
            </section>
            <section className="home-shortcuts" aria-labelledby="shortcuts-heading">
              <h2 id="shortcuts-heading">{t('homeShortcuts')}</h2>
              <div className="shortcut-grid">
                <button onClick={() => go('career')}><Briefcase aria-hidden="true" size={25} /><strong>{t('careerShortcut')}</strong><span>{t('careerShortcutDetail')}</span><ArrowRight aria-hidden="true" size={21} /></button>
                <button onClick={() => go('money')}><Wallet aria-hidden="true" size={25} /><strong>{t('moneyShortcut')}</strong><span>{t('moneyShortcutDetail')}</span><ArrowRight aria-hidden="true" size={21} /></button>
              </div>
            </section>
            <section className="human-help" aria-labelledby="human-help-heading">
              <div className="human-symbol"><HandHeart size={48} strokeWidth={1.35} aria-hidden="true" /></div>
              <div><p className="eyebrow">{t('human')}</p><h2 id="human-help-heading">{t('humanIntro')}</h2><p>{t('humanBody')}</p></div>
              <a className="button" href="tel:211"><Phone size={19} aria-hidden="true" />{t('call211')}<ArrowRight size={18} aria-hidden="true" /></a>
            </section>
            {aiAvailable && <details className="home-assistance"><summary>{t('aiAlternative')}</summary><p>{t('aiAlternativeIntro')}</p>
              <AiAssist text={text} language={language} onNeeds={run} />
            </details>}
          </div>
        </section>}
        {(route.view === 'confirm' || route.view === 'guided') && <>
          {signal?.warnings.length ? <div className="narrow notice" role="status">{signal.warnings.map((warning, index) => <p key={index}>{warning[language]}</p>)}</div> : null}
          <HouseholdFlow key={flowRevision} language={language} initial={household} confirmation={route.view === 'confirm'}
            inferred={[...(signal?.flags ?? []), ...(signal?.deniedFlags ?? [])]} onCancel={() => go('find')}
            onSubmit={answer => { setHousehold(answer); setConfirmed(true); setResultLimit(3); go(signal?.wantsNearby ? 'nearby' : 'results') }} />
        </>}
        {route.view === 'results' && <section>
          <h1 tabIndex={-1}>{t('results')}</h1><p>{t('resultsNote')}</p>
          <div className="button-row"><button onClick={() => { setFlowRevision(value => value + 1); go('confirm') }}>{t('edit')}</button><button onClick={() => go('nearby')}>{t('nearHeading')}</button></div>
          {activePathway && <PathwayFacts pathway={activePathway} language={language} />}
          {recommendations.length > 0 && <div className="segmented" role="group" aria-label={t('results')}>
            <button aria-pressed={resultsTab === 'plan'} onClick={() => setResultsTab('plan')}>{t('planTab')}</button>
            <button aria-pressed={resultsTab === 'list'} onClick={() => setResultsTab('list')}>{t('listTab')} ({recommendations.length})</button>
          </div>}
          {resultsTab === 'plan' && recommendations.length > 0 ? <ActionPlan plan={plan} language={language} steps={steps} onOpen={openProgram} onOpenSteps={() => go('steps')} /> : <>
            <div className="results-list">{recommendations.slice(0, resultLimit).map(result =>
              <ProgramCard key={result.program.id} program={result.program} language={language} likelihood={result.likelihood}
                reasons={result.reasons} missing={result.missing} onOpen={openProgram} />)}</div>
            {recommendations.length > resultLimit && <button className="show-more" onClick={() => setResultLimit(value => value + 3)}>{t('showMore')} ({recommendations.length - resultLimit})</button>}
          </>}
          {recommendations.length === 0 && <p className="empty-state">{t('noResults')}</p>}
          <button className="text-button" onClick={() => go('directory')}>{t('directory')}</button>
        </section>}
        {route.view === 'nearby' && <NearbyHelp key={flowRevision} language={language} initialZip={confirmed ? household.zip : null} initialKinds={confirmed ? signal?.placeKinds : []} />}
        {route.view === 'pathway' && <PathwayView pathwayId={pathwayId} language={language} onStart={startPathway} onOpen={openPathway} onTool={tool => go(tool)} />}
        {route.view === 'career' && <CareerBuilder language={language} onOpen={openProgram} />}
        {route.view === 'money' && <MoneyCheck language={language} onOpen={openProgram} onPlan={needs => startGuided(needs)} />}
        {route.view === 'steps' && <MySteps language={language} steps={steps} onOpen={openProgram} />}
        {route.view === 'directory' && <section><h1 tabIndex={-1}>{t('directory')}</h1><p>{t('resultsNote')}</p>
          <div className="panel directory-tools"><div className="field"><label htmlFor="program-search">{t('search')}</label><input id="program-search" type="search" value={search} onChange={event => { setSearch(event.target.value); setDirectoryLimit(10) }} /></div>
            <div className="field"><label htmlFor="program-category">{t('category')}</label><select id="program-category" value={category} onChange={event => { setCategory(event.target.value as BenefitCategory | 'all'); setDirectoryLimit(10) }}>
              <option value="all">{t('allCategories')}</option>{categoryOrder.map(value => <option key={value} value={value}>{categoryLabels[value][language]}</option>)}
            </select></div></div>
          <div className="results-list">{directory.slice(0, directoryLimit).map(program => <ProgramCard key={program.id} program={program} language={language} onOpen={openProgram} />)}</div>
          {directory.length === 0 && <p>{t('noResults')}</p>}
          {directory.length > directoryLimit && <button className="show-more" onClick={() => setDirectoryLimit(directory.length)}>{t('showAll')} ({directory.length})</button>}
        </section>}
        {route.view === 'more' && <section className="narrow"><h1 tabIndex={-1}>{t('more')}</h1><div className="menu-list">
          <button onClick={() => go('directory')}>{t('directory')}<ArrowRight aria-hidden="true" size={20} /></button>
          <button onClick={() => { setPathwayId(null); go('pathway') }}>{t('pathways')}<ArrowRight aria-hidden="true" size={20} /></button>
          <button onClick={() => go('money')}>{t('moneyCheck')}<ArrowRight aria-hidden="true" size={20} /></button>
          <button onClick={() => go('about')}>{t('about')}<ArrowRight aria-hidden="true" size={20} /></button>
          <a href="tel:211">{t('call211')}</a>
        </div><CommonTerms language={language} /></section>}
        {route.view === 'about' && <section className="narrow"><h1 tabIndex={-1}>{t('about')}</h1><p>{t('aboutText')}</p>
          <h2>{t('privacyHeading')}</h2><p>{t('privacyAbout')}</p>
          <CommonTerms language={language} />
          <h2>{t('dataHeading')}</h2><p><strong>{programs.length}</strong> {t('programCount')}. <strong>{places.length}</strong> {t('placeCount')}.</p><p>{t('noStatistics')}</p>
          <h2>{t('sources')}</h2><p>{t('callAhead')}</p><DataSources language={language} />
        </section>}
        {route.view === 'urgent' && (signal?.emergency ? <UrgentHelp language={language} emergency={signal.emergency} onReset={reset} /> :
          <section className="narrow"><h1 tabIndex={-1}>{t('urgent')}</h1><p>{t('urgent911')}</p><a className="button primary" href="tel:911">{t('call')} 9-1-1</a><button onClick={reset}>{t('reset')}</button></section>)}
      </main>
      <footer className="site-footer"><p className="footer-note">{t('independent')}</p>
        <button onClick={() => steps.entries.length ? setConfirmReset(true) : reset()} aria-expanded={steps.entries.length ? confirmReset : undefined}>{t('reset')}</button>
        {confirmReset && <div className="notice reset-confirm" role="region" aria-label={t('reset')}>
          <p>{t('resetSavedNote').replace('{count}', String(steps.entries.length))}</p>
          <div className="button-row">
            <button className="primary" onClick={reset}>{t('resetAnswersOnly')}</button>
            <button onClick={() => { steps.clear(); reset() }}>{t('resetEverything')}</button>
            <button className="text-button" onClick={() => setConfirmReset(false)}>{t('cancel')}</button>
          </div>
        </div>}
      </footer>
    </div>
    {selected && <ProgramDetail key={selected.id} language={language} program={selected} onClose={closeProgram} steps={steps} returnFocus={opener} />}
  </>
}
