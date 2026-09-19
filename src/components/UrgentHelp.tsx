import { createTranslator } from '../lib/i18n'
import { emergencyContacts, type Emergency } from '../lib/emergency'
import type { Language } from '../types'

export default function UrgentHelp({ language, emergency, onReset }: { language: Language; emergency: Emergency; onReset: () => void }) {
  const t = createTranslator(language)
  const mental = emergency === 'crisis'
  const domestic = emergency === 'violence'
  if (emergency === 'veterinary') return <section className="narrow urgent-panel" aria-labelledby="urgent-title">
    <h1 id="urgent-title">{language === 'en' ? 'Urgent veterinary care' : 'Atención veterinaria urgente'}</h1>
    <p>{emergencyContacts.veterinary[language]}</p>
    <div className="urgent-actions">
      <a className="button primary" href="https://www.veg.com/locations" target="_blank" rel="noreferrer">
        {language === 'en' ? 'Find an emergency veterinary hospital' : 'Buscar un hospital veterinario de urgencias'}
      </a>
    </div>
    <p className="hint">{language === 'en' ? 'VEG ER for Pets: an external emergency-hospital directory, not free care or a financial-assistance program. You may use any emergency veterinarian. If a person is also in immediate danger, call 911.' : 'VEG ER for Pets: directorio externo de hospitales de urgencias, no atención gratuita ni programa de ayuda económica. Puede acudir a cualquier veterinario de urgencias. Si una persona también está en peligro inmediato, llame al 911.'}</p>
    <button onClick={onReset}>{t('reset')}</button>
  </section>
  return <section className="narrow urgent-panel" aria-labelledby="urgent-title">
    <h1 id="urgent-title">{t('urgent')}</h1><p>{emergencyContacts[emergency][language]}</p>
    <div className="urgent-actions">
      <a className="button primary" href="tel:911">{t('call')} 9-1-1</a>
      {mental && <><a className="button primary" href="tel:988">{t('call')} 9-8-8</a><a className="button" href={language === 'es' ? 'sms:988?body=AYUDA' : 'sms:988'}>{t('text988')}</a>
        <a className="button" href={language === 'es' ? 'https://988lifeline.org/es/' : 'https://988lifeline.org/'} target="_blank" rel="noreferrer">{t('crisisWebsite')}</a></>}
      {domestic && <><a className="button primary" href="tel:+18007997233">{t('call')} 800-799-7233</a>
        <a className="button" href="sms:88788?body=START">{language === 'en' ? 'Text START to 88788' : 'Envíe START al 88788'}</a>
        <a className="button" href={language === 'es' ? 'https://www.thehotline.org/es/' : 'https://www.thehotline.org/'} target="_blank" rel="noreferrer">{t('domesticWebsite')}</a></>}
    </div><p>{t('urgentNote')}</p>
    <p className="hint">{t('sources')}: <a href={domestic ? 'https://www.thehotline.org/' : mental ? 'https://988lifeline.org/' : 'https://www.911.gov/'} target="_blank" rel="noreferrer">{domestic ? 'National Domestic Violence Hotline' : mental ? '988 Lifeline' : '911.gov'}</a></p>
    <button onClick={onReset}>{t('reset')}</button>
  </section>
}
