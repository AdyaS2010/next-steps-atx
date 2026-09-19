import { normalize } from './format'

const animal = /\b(?:pets?|dogs?|cats?|pupp(?:y|ies)|kittens?|rabbits?|birds?|mascotas?|perr[oa]s?|gat[oa]s?|cachorros?|gatitos?|perritos?|conejos?|pajaros?)\b/
const veterinary = /\b(?:veterinar(?:y|ian|ians|io|ios|ia|ias)|spay(?:ing|ed)?|neuter(?:ing|ed)?|emancipet|pet care|pet food|comida para mascotas|esterilizacion)\b|\bvet(?:s)?\s+(?:care|bills?|visits?|clinics?|appointments?|near|exams?)\b|\b(?:see|find|need|afford|emergency)\s+(?:a\s+|the\s+)?vet\b/
const humanInjury = /\b(?:bit|bitten|scratched|attacked)\b.{0,45}\b(?:me|my (?:child|son|daughter|hand|leg|arm)|a person)\b|\b(?:me|mi (?:hijo|hija|mano|pierna))\b.{0,30}\b(?:mordio|mordido|ataco|aranado)\b|\b(?:i|my (?:child|son|daughter))\s+(?:swallowed|ate|drank)\b/

/** Keep pet care from creating human household facts or human-clinic requests. */
export function splitCareContext(input: string): { humanText: string; petText: string } {
  const normalized = normalize(input).replace(/[’‘]/g, "'")
  const chunks = normalized.split(/[!?;\n]+|\.(?=\s|$)|,(?!\d)|\b(?:and|but|y|pero)\s+(?=(?:i|we|my|our|yo|nosotros|mi|mis|nuestro|nuestra)\b)/)
  const human: string[] = []
  const pet: string[] = []
  for (const chunk of chunks) {
    if ((animal.test(chunk) || veterinary.test(chunk)) && !humanInjury.test(chunk)) {
      pet.push(chunk)
      if (/\b(?:my|our|mi|mis)\s+(?:son|daughter|child|children|mother|father|hijo|hija|madre|padre)\b.{0,50}\b(?:and|y)\b/.test(chunk)) human.push(chunk)
    }
    else human.push(chunk)
  }
  return pet.length ? { humanText: human.join('; '), petText: pet.join('; ') } : { humanText: normalized, petText: '' }
}
