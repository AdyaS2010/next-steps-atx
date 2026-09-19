import { Apple, Baby, BriefcaseBusiness, BusFront, CircleHelp, GraduationCap, HeartPulse, House, PawPrint, Scale, Users, Wallet } from 'lucide-react'
import { categoryLabels, categoryOrder } from '../data/facts'
import type { BenefitCategory, Language } from '../types'

const icons = {
  food: Apple, housing: House, health: HeartPulse, utilities: Wallet,
  income: BriefcaseBusiness, transportation: BusFront, family: Baby,
  education: GraduationCap, financial: Wallet, special: Users, safety: Scale,
  pets: PawPrint,
}

export default function NeedButtons({ language, selected, onChoose, compact = false }: {
  language: Language
  selected?: BenefitCategory[]
  onChoose: (category: BenefitCategory) => void
  compact?: boolean
}) {
  return <div className={`need-grid${compact ? ' compact' : ''}`}>
    {categoryOrder.map(category => {
      const Icon = icons[category] ?? CircleHelp
      return <button type="button" className="need-button" key={category}
        aria-pressed={selected ? selected.includes(category) : undefined}
        onClick={() => onChoose(category)}>
        <Icon size={23} aria-hidden="true" /><span>{categoryLabels[category][language]}</span>
      </button>
    })}
  </div>
}
