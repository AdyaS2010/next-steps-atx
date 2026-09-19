import type { Language, Localized } from '../types'

export function localize(value: Localized, language: Language): string {
  return value[language] || value.en
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

export function formatMoney(value: number): string {
  return `$${value.toLocaleString('en-US')}`
}
