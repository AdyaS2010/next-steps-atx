import { ArrowRight, Baby, Briefcase, Globe, GraduationCap, HeartHandshake, Home, KeyRound, Lock, LogOut, Receipt, RefreshCw, Rocket, ShieldCheck, Store, Tent } from 'lucide-react'
import { useState } from 'react'
import { pathways, type Pathway } from '../data/pathways'
import { createTranslator } from '../lib/i18n'
import type { Language } from '../types'

const icons = {
  home: Home, briefcase: Briefcase, baby: Baby, globe: Globe,
  heart: HeartHandshake, shield: ShieldCheck, tent: Tent, receipt: Receipt,
  key: KeyRound, lock: Lock, rocket: Rocket,
  refresh: RefreshCw, graduation: GraduationCap, store: Store,
} satisfies Record<Pathway['icon'], unknown>

export function PathwayGrid({ language, onOpen, limit }: { language: Language; onOpen: (id: string) => void; limit?: number }) {
  const t = createTranslator(language)
  const [expanded, setExpanded] = useState(false)
  const shown = limit && !expanded ? pathways.slice(0, limit) : pathways
  return <>
  <div className="pathway-grid" id="pathway-grid">
    {shown.map(pathway => {
      const Icon = icons[pathway.icon]
      return <button key={pathway.id} className="pathway-card" onClick={() => onOpen(pathway.id)}>
        <span className="pathway-icon"><Icon size={22} aria-hidden="true" /></span>
        <strong>{pathway.title[language]}</strong>
        <span className="pathway-summary">{pathway.summary[language]}</span>
        <ArrowRight size={19} aria-hidden="true" />
      </button>
    })}
  </div>
  {limit && pathways.length > limit && <button className="show-all" aria-expanded={expanded} aria-controls="pathway-grid" onClick={() => setExpanded(value => !value)}>
    {t(expanded ? 'showFewerPathways' : 'showAllPathways')}{expanded ? '' : ` (${pathways.length})`}</button>}
  </>
}

/** Replaces the current history entry so Back does not return here. */
export function QuickExit({ language }: { language: Language }) {
  const t = createTranslator(language)
  return <button className="quick-exit" title={t('quickExitHint')}
    onClick={() => window.location.replace('https://weather.com/')}>
    <LogOut size={18} aria-hidden="true" />{t('quickExit')}
  </button>
}

export function PathwayFacts({ pathway, language }: { pathway: Pathway; language: Language }) {
  const t = createTranslator(language)
  return <section className="pathway-facts" aria-labelledby={`facts-${pathway.id}`}>
    <h2 id={`facts-${pathway.id}`}>{t('pathwayFacts')}</h2>
    <ul>{pathway.facts.map((fact, index) => <li key={index}>
      <p>{fact.text[language]}</p>
      <a href={fact.source.url} target="_blank" rel="noreferrer">{fact.source.label}</a>
    </li>)}</ul>
    <p className="hint">{t('pathwayNote')}</p>
  </section>
}

export function PathwayView({ pathwayId, language, onStart, onOpen, onTool }: {
  pathwayId: string | null
  language: Language
  onStart: (pathway: Pathway) => void
  onOpen: (id: string) => void
  onTool: (tool: 'career') => void
}) {
  const t = createTranslator(language)
  const pathway = pathways.find(item => item.id === pathwayId)
  if (!pathway) return <section>
    <h1 tabIndex={-1}>{t('pathways')}</h1><p>{t('pathwaysIntro')}</p>
    <PathwayGrid language={language} onOpen={onOpen} />
  </section>
  const Icon = icons[pathway.icon]
  return <section className="narrow pathway-view">
    {pathway.quickExit && <div className="quick-exit-bar"><QuickExit language={language} /><p className="hint">{t('quickExitHint')}</p></div>}
    <p className="eyebrow"><Icon size={18} aria-hidden="true" /> {t('pathways')}</p>
    <h1 tabIndex={-1}>{pathway.title[language]}</h1>
    <p>{pathway.summary[language]}</p>
    <PathwayFacts pathway={pathway} language={language} />
    <div className="button-row pathway-actions">
      {pathway.tool && <button className="primary main-cta" onClick={() => onTool(pathway.tool!)}>{t('careerPathway')}<ArrowRight size={19} aria-hidden="true" /></button>}
      <button className={pathway.tool ? 'main-cta' : 'primary main-cta'} onClick={() => onStart(pathway)}>{t('pathwayStart')}<ArrowRight size={19} aria-hidden="true" /></button>
    </div>
  </section>
}
