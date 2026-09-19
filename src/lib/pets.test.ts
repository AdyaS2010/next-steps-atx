import { describe, expect, it } from 'vitest'
import { programs } from '../data/programs'
import { interpretSituation, householdFromSignal, navigatorDestination } from './navigator'
import { emptyHousehold, rankRecommendations } from './eligibility'
import { detectEmergency } from './emergency'
import { parseAiSuggestions } from './ai-contract'

describe('pets and veterinary support', () => {
  it.each([
    'I need a low-cost vet for my dog',
    'My cat needs food and vaccinations',
    'Necesito un veterinario para mi perro',
    'Necesito comida para mascotas',
    'Find a vet clinic near me',
    'My senior dog is disabled and has no insurance',
  ])('keeps pet requests out of human clinics and household assumptions: %s', text => {
    const signal = interpretSituation(text, 'en')
    expect(signal.categories).toEqual(['pets'])
    expect(signal.flags).toEqual([])
    expect(signal.placeKinds).toEqual([])
    expect(signal.wantsNearby).toBe(false)
    expect(navigatorDestination(signal)).toBe('results')
    expect(rankRecommendations(programs, householdFromSignal(signal)).every(result => result.program.category === 'pets')).toBe(true)
  })

  it('preserves independent human needs, income and veteran facts', () => {
    const signal = interpretSituation('I am a veteran. I earn $2,400 a month. My cat needs food. I also need rent help.', 'en')
    expect(signal.categories).toEqual(expect.arrayContaining(['pets', 'housing', 'special']))
    expect(signal.flags).toContain('isVeteranHousehold')
    expect(signal.monthlyIncome).toBe(2400)
    expect(interpretSituation('I need food for my dog and my family', 'en').categories).toEqual(expect.arrayContaining(['food', 'pets']))
  })

  it('does not classify a pet-ownership denial or a veteran as a pet-care request', () => {
    expect(interpretSituation('I have no pets. I need help with rent.', 'en').categories).not.toContain('pets')
    expect(interpretSituation('I am a veteran and need benefits', 'en').categories).not.toContain('pets')
  })

  it.each([
    'My dog cannot breathe',
    'Mi perro no puede respirar',
    'My cat is unconscious',
    'My dog was hit by a car just now',
    'My cat has heatstroke',
  ])('routes urgent animal concerns to veterinary care: %s', text => {
    expect(detectEmergency(text)).toBe('veterinary')
    expect(rankRecommendations(programs, emptyHousehold(), interpretSituation(text, 'en'))).toEqual([])
  })

  it('retains human emergency priority in mixed situations and animal injuries to people', () => {
    expect(detectEmergency('My dog is unconscious and I cannot breathe')).toBe('medical')
    expect(detectEmergency('My son and dog are unconscious')).toBe('medical')
    expect(detectEmergency('A dog bit me and I have severe bleeding')).toBe('medical')
    expect(detectEmergency('My dog had heatstroke last year')).toBeNull()
    expect(detectEmergency('My cat is not unconscious')).toBeNull()
  })

  it('provides five sourced options without presenting the paused pantry as available', () => {
    const pets = programs.filter(program => program.category === 'pets')
    expect(pets).toHaveLength(5)
    const ranked = rankRecommendations(programs, { ...emptyHousehold(), needs: ['pets'] })
    expect(ranked.slice(0, 3).map(result => result.program.id)).toEqual(['emancipet-clinics', 'emancipet-free-days', 'apa-pass'])
    expect(ranked.at(-1)?.program.id).toBe('ahs-pet-pantry')
    expect(ranked.at(-1)?.program.applicationStatus).toBe('closed')
    const pals = pets.find(program => program.id === 'mow-pals')!
    expect(pals.eligibilitySummary.en).toContain('home-delivered meals')
    expect(pals.requiresAny).toBeUndefined()
    expect(pets.find(program => program.id === 'emancipet-free-days')?.jurisdiction).toBe('regional')
    expect(parseAiSuggestions({ needs: ['pets'], confidence: 'high' })).toEqual({ needs: ['pets'], confidence: 'high' })
  })
})
