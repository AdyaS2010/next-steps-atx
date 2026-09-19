import type { BenefitCategory, Localized } from '../types'

export const categoryLabels: Record<BenefitCategory, Localized> = {
  food: { en: 'Food', es: 'Comida' },
  housing: { en: 'Housing', es: 'Vivienda' },
  health: { en: 'Health', es: 'Salud' },
  utilities: { en: 'Bills', es: 'Facturas' },
  income: { en: 'Work & income', es: 'Trabajo e ingresos' },
  transportation: { en: 'Transportation', es: 'Transporte' },
  family: { en: 'Children & care', es: 'Niños y cuidados' },
  education: { en: 'Learning', es: 'Educación' },
  financial: { en: 'Money & taxes', es: 'Dinero e impuestos' },
  special: { en: 'Other support', es: 'Otros apoyos' },
  safety: { en: 'Safety & legal help', es: 'Seguridad y ayuda legal' },
  pets: { en: 'Pets & vet care', es: 'Mascotas y veterinaria' },
}

export const categoryOrder: BenefitCategory[] = [
  'food', 'housing', 'health', 'utilities', 'income', 'transportation',
  'family', 'education', 'financial', 'pets', 'special', 'safety',
]
