import type { Localized } from '../types'
import { normalize } from './format'
import { splitCareContext } from './pet-context'

export type Emergency = 'medical' | 'crisis' | 'violence' | 'veterinary'
type HumanEmergency = Exclude<Emergency, 'veterinary'>

/** Static US contacts, not a diagnosis or a substitute for emergency services. */
export const emergencyContacts: Record<Emergency, Localized> = {
  veterinary: {
    en: 'Possible pet emergency: contact your veterinarian or an emergency veterinary hospital now. Do not wait for a free clinic, food pantry or financial-assistance application. Emergency care may have charges; ask the hospital about costs and payment options. This guide cannot assess your pet.',
    es: 'Posible emergencia de una mascota: contacte a su veterinario o un hospital veterinario de urgencias ahora. No espere una clínica gratuita, despensa o solicitud de ayuda económica. La atención puede tener cargos; pregunte por costos y opciones de pago. Esta guía no puede evaluar a su mascota.',
  },
  medical: {
    en: 'Possible medical emergency: call 911 now. Do not wait for benefits or a cooling center. For suspected heatstroke, move to a cooler place and begin cooling while help is on the way.',
    es: 'Posible emergencia médica: llame al 911 ahora. No espere beneficios ni un centro de enfriamiento. Si sospecha un golpe de calor, vaya a un lugar más fresco y comience a enfriarse mientras llega la ayuda.',
  },
  crisis: {
    en: 'For immediate danger, an attempt, or a medical emergency, call 911. For suicide or emotional crisis support, call or text 988; Spanish is available by calling 988 and pressing 2 or texting AYUDA to 988.',
    es: 'Si hay peligro inmediato, un intento o una emergencia médica, llame al 911. Para apoyo ante una crisis emocional o suicida, llame al 988 y oprima 2, o envíe AYUDA al 988 por texto.',
  },
  violence: {
    en: 'If you are in immediate danger, call 911 if it is safe to do so. For confidential domestic violence support, call 800-799-7233 or text START to 88788. Use a safer device if yours may be monitored.',
    es: 'Si está en peligro inmediato, llame al 911 si puede hacerlo con seguridad. Para apoyo confidencial por violencia doméstica, llame al 800-799-7233 o envíe START al 88788. Use un dispositivo más seguro si el suyo puede estar vigilado.',
  },
}

const patterns: Record<HumanEmergency, RegExp[]> = {
  medical: [
    /\b(?:heat\s?stroke|golpe de calor|insolacion)\b/g,
    /\b(?:chest pain|pain in (?:my|the) chest|dolor (?:en el|de) pecho|heart attack|ataque al corazon)\b/g,
    /\b(?:can'?t breathe|cannot breathe|struggling to breathe|trouble breathing|no puedo respirar|no puede respirar|dificultad para respirar)\b/g,
    /\b(?:unconscious|unresponsive|inconsciente|no (?:me )?responde|overdose|overdosed|sobredosis|suicide attempt|intento de suicidio|severe bleeding|bleeding heavily|sangrado abundante|sangrado intenso)\b/g,
    /\b(?:having a stroke|stroke symptoms|derrame cerebral|accidente cerebrovascular)\b/g,
  ],
  crisis: [
    /\b(?:suicidal|suicide|suicida|suicidio|suicidarme|suicidarse|matarme|quitarme la vida)\b/g,
    /\b(?:kill myself|killing myself|end my life|ending my life|hurt myself|harm myself|self harm|self-harm|want to die|wanna die|quiero morir|hacerme dano)\b/g,
    /\b(?:don'?t want to live|do not want to live|no quiero vivir)\b/g,
  ],
  violence: [
    /\b(?:immediate danger|in danger (?:right )?now|unsafe right now|being attacked|attacking me|hitting me|threatening to kill me|threatened to kill me)\b/g,
    /\b(?:threatening me with (?:a |an )?(?:gun|knife|weapon)|pointing (?:a |the )?gun at me|hurting me right now)\b/g,
    /\b(?:peligro inmediato|en peligro (?:ahora|en este momento)|me esta (?:golpeando|atacando|lastimando)|me estan (?:golpeando|atacando)|me amenaza con (?:matarme|una pistola|un cuchillo)|me quiere matar|me pega ahora)\b/g,
    /\b(?:domestic violence|violencia domestica|abuse|abuso)\b(?=[^.!?;]{0,45}\b(?:right now|ahora|inmediato)\b)/g,
  ],
}

function isCurrentConcern(text: string, start: number, end: number): boolean {
  const before = text.slice(Math.max(0, start - 150), start).split(/[.!?;,\n]|\b(?:but|pero|and|y|ahora|now)\b/).at(-1) ?? ''
  const after = text.slice(end, end + 100).split(/[.!?;,\n]|\b(?:but|pero|and now|y ahora)\b/)[0]
  const uncertain = /\b(?:not sure|no se|no estoy segur[oa])\b/.test(before)
  if (!uncertain && /\b(?:not|no|never|without|denies|deny|niega|sin|don'?t|do not)\b(?:\s+[a-z']+){0,5}\s*$/.test(before)) return false
  const recentOrOngoing = /\b(?:just|right now|currently|today|for (?:an?|\d+) (?:minutes?|hours?)|have had|has had|am having|is having|still have|still has|en este momento|hoy|acabo de|sigo con)\b/.test(before + ' ' + after)
    || /\b(?:have|has|am|is|tengo|tiene|estoy|esta)\s+(?:(?:a|an|un|una|severe|possible)\s+)?$/.test(before)
  if (!recentOrOngoing && /\b(?:used to|history of|previous|previously|in the past|recovering from|recovered from|had|was|were|tenia|tuve|tuvo|estaba|antecedentes de|recuperad[oa] de)\b[^.!?;]*$/.test(before)) return false
  if (/\b(?:last (?:year|month|week)|years? ago|months? ago|yesterday|in 20\d\d|in the past|el ano pasado|el mes pasado|en el pasado|hace (?:\d+|un|dos|tres) anos|ayer)\b/.test(before + ' ' + after)) return false
  if (/\b(?:prevent|prevention|training|class|course|research|article|information about|what is|what are|learn about|preventing|prevenir|prevencion|curso|informacion sobre|que es)\b[^.!?;]*$/.test(before)) return false
  return !/\b(?:prevention|training|awareness|prevencion)\b/.test(after)
}

/** Conservative present-tense safety routing; cannot identify every emergency. */
export function detectEmergency(input: string): Emergency | null {
  const { humanText, petText } = splitCareContext(input)
  const text = normalize(humanText).replace(/[’‘]/g, "'")
  // Ongoing violence takes priority over a threat's incidental suicide vocabulary.
  for (const kind of ['medical', 'violence', 'crisis'] as const) {
    for (const pattern of patterns[kind]) {
      for (const match of text.matchAll(pattern)) {
        if (isCurrentConcern(text, match.index, match.index + match[0].length)) return kind
      }
    }
  }
  const petPatterns = [
    ...patterns.medical,
    /\b(?:hit by (?:a )?car|poisoned|swallowed poison|ate poison|seizures?|collapsed|pet emergency|emergency vet|atropellad[oa]|envenenad[oa]|convulsiones|emergencia veterinaria)\b/g,
  ]
  for (const pattern of petPatterns) {
    for (const match of petText.matchAll(pattern)) {
      if (isCurrentConcern(petText, match.index, match.index + match[0].length)) return 'veterinary'
    }
  }
  return null
}
