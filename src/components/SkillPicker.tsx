import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { skillGroups } from '../data/skills'
import { normalize } from '../lib/format'
import { splitList } from '../lib/career'
import { createTranslator } from '../lib/i18n'
import type { Language } from '../types'

/** Skills are stored as a comma-separated string on the résumé. */
export function SkillPicker({ language, value, suggested, onChange }: {
  language: Language
  value: string
  suggested: string[]
  onChange: (value: string) => void
}) {
  const t = createTranslator(language)
  const [draft, setDraft] = useState('')
  const [group, setGroup] = useState<string>('suggested')
  const [query, setQuery] = useState('')
  const skills = splitList(value)
  const has = (skill: string) => skills.some(item => normalize(item) === normalize(skill))
  const save = (next: string[]) => onChange(next.join(', '))
  const add = (items: string[]) => save([...skills, ...items.map(item => item.trim()).filter(item => item && !has(item))])
  const toggle = (skill: string) => has(skill) ? save(skills.filter(item => normalize(item) !== normalize(skill))) : add([skill])
  const library = [
    { id: 'suggested', label: t('suggestedSkills'), skills: [...new Set(suggested)] },
    ...skillGroups.map(item => ({ id: item.id, label: item.label[language], skills: item.skills.map(skill => skill[language]) })),
  ].filter(item => item.skills.length)
  const active = library.find(item => item.id === group) ?? library[0]
  const search = normalize(query)
  const visible = search
    ? [...new Set(library.flatMap(item => item.skills))].filter(skill => normalize(skill).includes(search))
    : active?.skills ?? []

  return <div className="skill-picker">
    <p className="field-label" id="skills-label">{t('skills')}</p>
    {skills.length > 0 ? <ul className="skill-chosen" aria-labelledby="skills-label">
      {skills.map(skill => <li key={skill}>{skill}
        <button type="button" aria-label={`${t('removeSkill')}: ${skill}`} onClick={() => toggle(skill)}><X size={14} aria-hidden="true" /></button>
      </li>)}
    </ul> : <p className="hint">{t('noSkillsYet')}</p>}
    <form className="inline-field" onSubmit={event => { event.preventDefault(); add(splitList(draft)); setDraft('') }}>
      <label className="visually-hidden" htmlFor="skill-add">{t('addYourSkill')}</label>
      <input id="skill-add" value={draft} placeholder={t('addYourSkill')} onChange={event => setDraft(event.target.value)} />
      <button type="submit" disabled={!draft.trim()}><Plus size={16} aria-hidden="true" />{t('addSkill')}</button>
    </form>
    <details className="skill-library" open>
      <summary>{t('browseSkills')}</summary>
      <div className="skill-search">
        <Search size={16} aria-hidden="true" />
        <label className="visually-hidden" htmlFor="skill-search">{t('searchSkills')}</label>
        <input id="skill-search" type="search" value={query} placeholder={t('searchSkills')} onChange={event => setQuery(event.target.value)} />
      </div>
      {!search && <div className="skill-tabs" role="group" aria-label={t('skillCategories')}>
        {library.map(item => <button type="button" key={item.id} aria-pressed={active?.id === item.id} onClick={() => setGroup(item.id)}>{item.label}</button>)}
      </div>}
      <div className="skill-options" role="group" aria-label={t('skillOptions')}>
        {visible.map(skill => <button type="button" key={skill} aria-pressed={has(skill)} onClick={() => toggle(skill)}>
          {has(skill) ? <X size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}{skill}
        </button>)}
        {visible.length === 0 && <p className="hint">{t('noSkillMatch')}</p>}
      </div>
    </details>
  </div>
}
