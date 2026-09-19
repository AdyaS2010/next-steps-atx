export type Language = 'en' | 'es'

export type Localized = {
  en: string
  es: string
}

export type Coordinates = {
  lat: number
  lng: number
}

/** Categorical facts about a household, gathered by the private screener. */
export type HouseholdFlag =
  | 'hasChildrenUnder18'
  | 'hasChildUnder5OrPregnant'
  | 'hasSenior60Plus'
  | 'hasDisability'
  | 'isVeteranHousehold'
  | 'isUninsured'
  | 'isUnemployed'
  | 'isRenter'
  | 'isImmigrantOrNewcomer'
  | 'isStudent'
  | 'isHomeowner'
  | 'isCaregiver'
  | 'isHomeless'
  | 'needsTransportation'
  | 'hasChildUnder13'
  | 'isWorkingOrTraining'

export type Household = {
  size: number | null
  /** Total household income per month in dollars, or null if unknown. */
  monthlyIncome: number | null
  zip: string | null
  county: 'travis' | 'other' | null
  needs: BenefitCategory[]
} & Record<HouseholdFlag, boolean | null>

export type Likelihood = 'likely' | 'maybe' | 'unlikely' | 'info'

export type BenefitCategory =
  | 'food'
  | 'health'
  | 'housing'
  | 'utilities'
  | 'family'
  | 'financial'
  | 'income'
  | 'special'
  | 'transportation'
  | 'education'
  | 'safety'
  | 'pets'

export type HelpOrg = {
  name: string
  phone?: string
  url?: string
  address?: string
  coordinates?: Coordinates
}

export type Program = {
  id: string
  name: string
  category: BenefitCategory
  agency: string
  provides: Localized
  eligibilitySummary: Localized
  /** Income limit as a percent of the Federal Poverty Level; omit for non-income programs. */
  fplLimit?: number
  /** Household must match at least one of these categorical flags to be a fit. */
  requiresAny?: HouseholdFlag[]
  /** Always surface for awareness regardless of the screener (e.g. free tax prep, 2-1-1). */
  alwaysShow?: boolean
  applyOnlineUrl?: string
  applyPhone?: string
  documents: Localized[]
  localHelp?: HelpOrg
  notes?: Localized
  /** Facts and application steps are sourced records, never model-generated. */
  sources?: { label: string; url: string; checkedOn: string }[]
  reviewedOn?: string
  serviceArea?: Localized
  jurisdiction?: 'travis' | 'austin' | 'texas' | 'regional' | 'national'
  applicationStatus?: 'accepting' | 'waitlist' | 'closed' | 'varies' | 'unknown'
  statusNote?: Localized
  actionKind?: 'apply' | 'information' | 'referral' | 'appointment'
  audience?: Localized
  requiresAll?: HouseholdFlag[]
  /** Broad relevance does not establish eligibility; omitted rules mean unknown. */
  screeningNote?: Localized
  steps?: { id: string; title: Localized; detail: Localized }[]
  availabilityVerifiedOn?: string
}

/** Physical places from the City of Austin open data portal. */
export type PlaceKind =
  | 'neighborhood-center'
  | 'wic'
  | 'clinic'
  | 'library'
  | 'rec-center'
  | 'senior-center'
  | 'nonprofit'
  | 'cooling'

export type Place = {
  id: string
  name: string
  kind: PlaceKind
  address?: string
  zip?: string
  phone?: string
  url?: string
  hours?: string
  /** Public-access computers (libraries only). */
  computers?: number
  wifi?: boolean
  lat: number
  lng: number
}

/** An income-restricted housing development from the Affordable Housing Inventory. */
export type HousingProject = {
  name: string
  address?: string
  zip?: string
  district?: string
  affordable: number
  total: number
  /** Units reserved at 30% / 50% / 60% of Median Family Income. */
  mfi30: number
  mfi50: number
  mfi60: number
  /** Permanent supportive housing units. */
  supportive: number
  lat: number
  lng: number
}
