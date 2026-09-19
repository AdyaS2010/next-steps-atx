import type { BenefitCategory } from '../types.ts'

export const AI_NEEDS = [
  'food', 'health', 'housing', 'utilities', 'family', 'financial',
  'income', 'special', 'transportation', 'education', 'safety', 'pets',
] as const satisfies readonly BenefitCategory[]

export type AiSuggestions = { needs: BenefitCategory[]; confidence: 'high' | 'low' }

export function parseAiSuggestions(value: unknown): AiSuggestions | null {
  if (!value || typeof value !== 'object' || !('needs' in value) ||
      !Array.isArray(value.needs) || value.needs.length > 5 ||
      !('confidence' in value) || !['high', 'low'].includes(String(value.confidence)) ||
      Object.keys(value).some(key => !['needs', 'confidence'].includes(key))) return null
  const needs: BenefitCategory[] = []
  for (const item of value.needs) {
    const need = AI_NEEDS.find(need => need === item)
    if (!need || needs.includes(need)) return null
    needs.push(need)
  }
  if (value.confidence === 'high' && needs.length === 0) return null
  return { needs, confidence: value.confidence === 'high' ? 'high' : 'low' }
}
