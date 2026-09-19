import { describe, expect, it } from 'vitest'
import { hasSignal, householdFromSignal, interpretSituation, MAX_SITUATION_LENGTH, navigatorDestination, rankRecommendations } from './navigator'

describe('situation interpreter', () => {
  it('extracts flags from a typical English sentence', () => {
    const signal = interpretSituation(
      "I lost my job and can't pay rent, I have two kids",
      'en',
    )
    expect(signal.flags).toContain('isUnemployed')
    expect(signal.flags).toContain('isRenter')
    expect(signal.flags).toContain('hasChildrenUnder18')
    expect(signal.categories).toContain('income')
    expect(signal.categories).toContain('housing')
    expect(interpretSituation('I was laid off last week', 'en').flags).toContain('isUnemployed')
    expect(interpretSituation('I was laid off years ago', 'en').flags).not.toContain('isUnemployed')
  })

  it('understands Spanish input', () => {
    const signal = interpretSituation(
      'Estoy embarazada y no tengo seguro medico',
      'es',
    )
    expect(signal.flags).toContain('hasChildUnder5OrPregnant')
    expect(signal.flags).toContain('isUninsured')
    expect(signal.categories).toContain('health')
  })

  it('detects household size', () => {
    expect(interpretSituation('family of 4', 'en').size).toBe(4)
    expect(interpretSituation('somos 5 en mi hogar', 'es').size).toBe(5)
    expect(interpretSituation('there are three people in my home', 'en').size).toBe(3)
  })

  it('detects monthly income and no-income', () => {
    expect(interpretSituation('I make $2000 a month', 'en').monthlyIncome).toBe(2000)
    expect(interpretSituation('we have no income right now', 'en').monthlyIncome).toBe(0)
  })

  it('flags a senior needing help with the electric bill', () => {
    const signal = interpretSituation('my elderly mother cannot pay her electric bill', 'en')
    expect(signal.flags).toContain('hasSenior60Plus')
    expect(signal.categories).toContain('utilities')
  })

  it('returns an empty signal for empty or meaningless text', () => {
    const signal = interpretSituation('   ', 'en')
    expect(hasSignal(signal)).toBe(false)
  })

  it('hasSignal is true when anything is detected', () => {
    expect(hasSignal(interpretSituation('I need food', 'en'))).toBe(true)
  })

  it.each([
    ["I'm not pregnant and I don't have any kids", 'en'],
    ['No estoy embarazada y no tengo hijos', 'es'],
    ['No tengo hijos ni estoy embarazada', 'es'],
  ] as const)('does not turn denied pregnancy or children into positive flags: %s', (text, lang) => {
    const signal = interpretSituation(text, lang)
    expect(signal.flags).not.toContain('hasChildrenUnder18')
    expect(signal.flags).not.toContain('hasChildUnder5OrPregnant')
    expect(signal.deniedFlags).toContain('hasChildrenUnder18')
    expect(signal.deniedFlags).toContain('hasChildUnder5OrPregnant')
  })

  it('does not treat pregnancy denial alone as denial of a combined pregnancy-or-child flag', () => {
    const signal = interpretSituation('I am not pregnant', 'en')
    expect(householdFromSignal(signal).hasChildUnder5OrPregnant).toBeNull()
    expect(interpretSituation('Not pregnant but I have a baby', 'en').flags).toContain('hasChildUnder5OrPregnant')
  })

  it('does not turn denial of one subgroup or symptom into a blanket household exclusion', () => {
    const signal = interpretSituation('No children under 5. Not blind. Not in the army. Not behind on rent. Not working.', 'en')
    const household = householdFromSignal(signal)
    expect(household.hasChildrenUnder18).toBeNull()
    expect(household.hasChildUnder13).toBeNull()
    expect(household.hasDisability).toBeNull()
    expect(household.isVeteranHousehold).toBeNull()
    expect(household.isRenter).toBeNull()
    expect(household.isWorkingOrTraining).toBeNull()
  })

  it('handles explicit positive and negative facts in mixed-language input', () => {
    const signal = interpretSituation('No tengo hijos. I lost my job y necesito comida. No estoy embarazada.', 'en')
    expect(signal.flags).toContain('isUnemployed')
    expect(signal.categories).toContain('food')
    expect(signal.deniedFlags).toContain('hasChildrenUnder18')
    expect(signal.deniedFlags).toContain('hasChildUnder5OrPregnant')
  })

  it('does not invent insurance, student, or senior status from related words', () => {
    const signal = interpretSituation('I need a doctor and medicine. The school is near my retired grandmother.', 'en')
    expect(signal.flags).not.toContain('isUninsured')
    expect(signal.flags).not.toContain('isStudent')
    expect(signal.flags).not.toContain('hasSenior60Plus')
  })

  it.each([
    ['I have health insurance', false],
    ['No tengo seguro médico', true],
    ['Tengo seguro médico', false],
    ["I don't have insurance", true],
  ] as const)('only proposes insurance status from explicit statements: %s', (text, expected) => {
    expect(householdFromSignal(interpretSituation(text, 'en')).isUninsured).toBe(expected)
  })

  it('leaves uncertain or conflicting flags unknown', () => {
    const uncertain = householdFromSignal(interpretSituation('I might be pregnant', 'en'))
    expect(uncertain.hasChildUnder5OrPregnant).toBeNull()
    const signal = interpretSituation('I am disabled, I am not disabled', 'en')
    expect(householdFromSignal(signal).hasDisability).toBeNull()
    expect(signal.warnings.length).toBeGreaterThan(0)
    expect(householdFromSignal(interpretSituation('I need to know if I have health insurance', 'en')).isUninsured).toBeNull()
  })

  it('proposes precise child age flags without counting an adult child as under 18', () => {
    const young = interpretSituation('My child is 3 years old', 'en')
    expect(young.flags).toEqual(expect.arrayContaining(['hasChildrenUnder18', 'hasChildUnder13', 'hasChildUnder5OrPregnant']))
    expect(interpretSituation('My son is 35 years old', 'en').flags).not.toContain('hasChildrenUnder18')
  })

  it('matches words rather than arbitrary substrings', () => {
    const signal = interpretSituation('heatstroke business bedroom creditable schoolhouse', 'en')
    expect(signal.categories).not.toContain('food')
    expect(signal.categories).not.toContain('transportation')
    expect(signal.categories).not.toContain('financial')
    expect(signal.categories).not.toContain('education')
    expect(signal.flags).not.toContain('hasChildrenUnder18')
  })

  it('does not match an explicitly denied need while retaining the requested one', () => {
    const signal = interpretSituation("I don't need food but I need housing", 'en')
    expect(signal.categories).not.toContain('food')
    expect(signal.categories).toContain('housing')
    expect(interpretSituation('No necesito comida pero necesito transporte', 'es').categories).toEqual(['transportation'])
    expect(interpretSituation('I have no food', 'en').categories).toContain('food')
  })

  it('matches bus and other newly supported needs bilingually', () => {
    expect(interpretSituation('I need bus fare for college', 'en').categories).toEqual(expect.arrayContaining(['transportation', 'education']))
    expect(interpretSituation('Necesito transporte y ayuda por violencia doméstica', 'es').categories).toEqual(expect.arrayContaining(['transportation', 'safety']))
  })

  it('replaces the whole proposed household for every submission', () => {
    const first = householdFromSignal(interpretSituation('Family of 4, no insurance, earn $2400 per month, ZIP 78701', 'en'))
    const secondSignal = interpretSituation('I need bus fare', 'en')
    const second = householdFromSignal(secondSignal)
    expect(first).toMatchObject({ size: 4, monthlyIncome: 2400, zip: '78701', isUninsured: true })
    expect(second).toMatchObject({ size: null, monthlyIncome: null, zip: null, county: null, isUninsured: null })
    second.needs.push('food')
    expect(secondSignal.categories).not.toContain('food')
  })

  it('handles excessive input without processing partial household facts', () => {
    const signal = interpretSituation('heatstroke ' + 'income 1000 monthly '.repeat(MAX_SITUATION_LENGTH), 'en')
    expect(signal.monthlyIncome).toBeNull()
    expect(signal.flags).toEqual([])
    expect(signal.emergency).toBe('medical')
    expect(signal.warnings[0].en).toContain('shorten')
  })

  it.each(['family of 0', 'household of 21', 'family of 2.5', 'family of 4, household of 3'])('does not silently clamp or invent household size: %s', (text) => {
    const signal = interpretSituation(text, 'en')
    expect(signal.size).toBeNull()
    expect(signal.warnings.length).toBeGreaterThan(0)
  })
})

describe('income and ZIP extraction', () => {
  it.each([
    ['I earn $6,000 a year', 500],
    ['annual income: $6000', 500],
    ['Mi ingreso anual es 6000', 500],
    ['Gano $6,000 al año', 500],
    ['My rent is $1800 per month and I earn $2400 per month', 2400],
    ['Pago renta de $1800 y gano $2400 al mes', 2400],
    ['I earn $300 weekly', 1300],
    ['I earn $600 every two weeks', 1300],
    ['Gano 600 cada dos semanas', 1300],
    ['I earn $600 twice a month', 1200],
    ['monthly income $2,400.50', 2400.5],
    ['Ingreso mensual 2.400,50', 2400.5],
    ['I make $90 a month', 90],
  ])('extracts only associated income with an explicit period: %s', (text, amount) => {
    const signal = interpretSituation(text as string, 'en')
    expect(signal.monthlyIncome).toBe(amount)
    expect(signal.warnings.some((warning) => /[Cc]onfirm/.test(warning.en))).toBe(true)
  })

  it('explains conversions and requires confirmation rather than silently treating yearly income as monthly', () => {
    const signal = interpretSituation('I earn $6000 annually', 'en')
    expect(signal.monthlyIncome).toBe(500)
    expect(signal.warnings.some((warning) => warning.en.includes('annual income ÷ 12') && warning.es.includes('Confirme'))).toBe(true)
  })

  it.each([
    '78701', 'ZIP 78701', '$2400', '$2400 monthly', 'I earn $2400',
    'rent $1800 per month', 'My debt is $6000', 'My electric bill is $300 a month',
    'No tengo dinero', 'I have no money', 'I earn -100 per month',
    'I earn $1000000000 per month', 'I earn 100 quincenal',
    'Income goes toward rent $1800 monthly',
  ])('does not guess monthly income from expenses, ZIPs, or ambiguous input: %s', (text) => {
    expect(interpretSituation(text, 'en').monthlyIncome).toBeNull()
  })

  it('does not silently sum different people’s wages or contradictory amounts', () => {
    const signal = interpretSituation('I earn 1500 monthly and my spouse earns 1200 monthly', 'en')
    expect(signal.monthlyIncome).toBeNull()
    expect(signal.warnings.some((warning) => warning.en.includes('one total household amount'))).toBe(true)
  })

  it('extracts a ZIP independently from income and never derives county', () => {
    const signal = interpretSituation('ZIP 78701, household income $6000 yearly', 'en')
    expect(signal.zip).toBe('78701')
    expect(signal.monthlyIncome).toBe(500)
    expect(householdFromSignal(signal).county).toBeNull()
    expect(interpretSituation('codigo postal 78702', 'es').zip).toBe('78702')
    expect(interpretSituation('I earn $78701 yearly', 'en').zip).toBeNull()
  })
})

describe('emergency triage', () => {
  it.each([
    ['I have heatstroke', 'medical'],
    ['Tengo un golpe de calor', 'medical'],
    ["I can't breathe", 'medical'],
    ['No puedo respirar', 'medical'],
    ['I have chest pain', 'medical'],
    ['Tengo dolor en el pecho', 'medical'],
    ['I am suicidal', 'crisis'],
    ['Quiero suicidarme', 'crisis'],
    ["I don't want to live", 'crisis'],
    ['No quiero vivir', 'crisis'],
    ['My partner is attacking me', 'violence'],
    ['Mi pareja me está golpeando', 'violence'],
    ['I am in immediate danger', 'violence'],
    ['Estoy en peligro inmediato', 'violence'],
    ['I had heatstroke last year but now I cannot breathe', 'medical'],
    ['I was suicidal last year but now I want to die', 'crisis'],
    ['I just overdosed', 'medical'],
    ['I have had chest pain for an hour', 'medical'],
    ['I think I had a heart attack just now', 'medical'],
    ['My partner is threatening me with a gun', 'violence'],
    ['Mi pareja me está lastimando', 'violence'],
    ['My AC was broken so I have heatstroke', 'medical'],
  ])('prioritizes present urgent concerns: %s', (text, emergency) => {
    const signal = interpretSituation(text, 'en')
    expect(signal.emergency).toBe(emergency)
    expect(navigatorDestination(signal)).toBe('results')
    expect(rankRecommendations([], householdFromSignal(signal), signal)).toEqual([])
  })

  it.each([
    'I am not suicidal', 'No soy suicida', 'No quiero suicidarme',
    'I am not having chest pain', 'No tengo dolor en el pecho',
    'I had heatstroke last year', 'Tuve un golpe de calor el año pasado',
    'I was suicidal last year', 'My father had a heart attack last month',
    'I need information about suicide prevention', 'Heatstroke prevention class',
    'My AC broke and I need somewhere cool', 'Help with domestic violence',
    'I am not in immediate danger', 'No estoy en peligro inmediato',
    'I had suicidal thoughts in the past',
  ])('avoids common denied, informational, and historical alarms: %s', (text) => {
    expect(interpretSituation(text, 'es').emergency).toBeNull()
  })
})

describe('place intent', () => {
  it('finds a library request and sends the user to the map', () => {
    const signal = interpretSituation('find a library near me', 'en')
    expect(signal.placeKinds).toContain('library')
    expect(signal.wantsNearby).toBe(true)
    expect(navigatorDestination(signal)).toBe('nearme')
  })

  it('treats a broken AC as a cooling need and a utilities problem', () => {
    const signal = interpretSituation('my ac broke and I need somewhere cool', 'en')
    expect(signal.placeKinds).toContain('cooling')
    // Rec centers double as cooling spots
    expect(signal.placeKinds).toContain('rec-center')
    expect(signal.categories).toContain('utilities')
    expect(navigatorDestination(signal)).toBe('nearme')
  })

  it('understands Spanish place requests', () => {
    const signal = interpretSituation('donde hay una clinica cerca de mi', 'es')
    expect(signal.placeKinds).toContain('clinic')
    expect(signal.wantsNearby).toBe(true)
    expect(navigatorDestination(signal)).toBe('nearme')
  })

  it('detects food pantry requests as neighborhood centers', () => {
    const signal = interpretSituation('where can I get free food', 'en')
    expect(signal.placeKinds).toContain('neighborhood-center')
    expect(navigatorDestination(signal)).toBe('nearme')
  })

  it('finds computers for filing an application online', () => {
    const signal = interpretSituation('I need a computer to apply online', 'en')
    expect(signal.placeKinds).toContain('library')
  })

  it('keeps hardship descriptions on the benefits results page', () => {
    const signal = interpretSituation("I lost my job and can't pay rent", 'en')
    expect(signal.placeKinds).toHaveLength(0)
    expect(navigatorDestination(signal)).toBe('results')
  })

  it('prefers benefits when a hardship is described without asking for a place', () => {
    const signal = interpretSituation('I am sick and have no insurance, I have two kids', 'en')
    expect(signal.flags.length).toBeGreaterThan(0)
    expect(navigatorDestination(signal)).toBe('results')
  })

  it('still goes to the map when a hardship explicitly asks for somewhere nearby', () => {
    const signal = interpretSituation(
      'I have no insurance and need the nearest clinic',
      'en',
    )
    expect(signal.flags).toContain('isUninsured')
    expect(signal.placeKinds).toContain('clinic')
    expect(navigatorDestination(signal)).toBe('nearme')
  })
})
