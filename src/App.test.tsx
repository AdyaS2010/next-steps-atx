import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import HouseholdFlow from './components/HouseholdFlow'
import VoiceInput from './components/VoiceInput'
import { emptyHousehold } from './lib/eligibility'
import { startDictation } from './lib/voice'
import { STEPS_KEY } from './lib/steps'

vi.mock('./lib/voice', () => ({
  isDictationSupported: () => true,
  isLocalDictationSupported: () => false,
  isReadAloudSupported: () => false,
  startDictation: vi.fn(() => () => undefined),
  speak: vi.fn(),
  stopSpeaking: vi.fn(),
}))

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  window.localStorage.clear()
  vi.stubGlobal('scrollTo', vi.fn())
  vi.clearAllMocks()
})
afterEach(() => { cleanup(); vi.unstubAllGlobals() })

async function describeNeed(text: string) {
  const user = userEvent.setup()
  await user.type(screen.getByRole('textbox', { name: 'Tell us what you need' }), text)
  await user.click(screen.getByRole('button', { name: 'Review my information' }))
  return user
}

describe('needs-first navigator', () => {
  it('offers pet care in both languages, with selectable and saveable service records', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Pets & vet care' }))
    await user.click(screen.getByRole('button', { name: 'Show options with what I have shared' }))
    expect(screen.getByRole('heading', { name: 'Emancipet Low-Cost Veterinary Clinics' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'SNAP Food Benefits' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'View details & next steps: Emancipet Low-Cost Veterinary Clinics' }))
    await user.click(screen.getByRole('button', { name: 'Save steps on this device' }))
    expect(JSON.parse(localStorage.getItem(STEPS_KEY)!).entries[0].programId).toBe('emancipet-clinics')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Clear answers & start over' }))
    await user.click(screen.getByRole('button', { name: 'Clear answers, keep My steps' }))
    expect(JSON.parse(localStorage.getItem(STEPS_KEY)!).entries).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Español' }))
    expect(screen.getByRole('button', { name: 'Mascotas y veterinaria' })).toBeVisible()
  })

  it('shows veterinary emergency resources rather than a human emergency call button', async () => {
    render(<App />)
    await describeNeed('My dog cannot breathe')
    expect(screen.getByRole('heading', { name: 'Urgent veterinary care' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Find an emergency veterinary hospital' })).toHaveAttribute('href', 'https://www.veg.com/locations')
    expect(document.querySelector('a[href="tel:911"]')).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Check what we understood' })).not.toBeInTheDocument()
  })
  it('starts with the input, practical need buttons, and five navigation choices', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Austin has support. Find yours.')
    expect(screen.getByRole('textbox', { name: 'Tell us what you need' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Food' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Transportation' })).toBeVisible()
    expect(within(screen.getByRole('navigation')).getAllByRole('button')).toHaveLength(5)
    expect(screen.queryByText('Who this helps')).not.toBeInTheDocument()
  })

  it('uses a local licensed bridge photo and clearly identifies the independent guide', () => {
    const { container } = render(<App />)
    const photo = container.querySelector('.hero-photo img')
    expect(photo).toHaveAttribute('src', '/pennybacker-1920.jpg')
    expect(photo).toHaveAttribute('alt', '')
    expect(container.querySelector('.hero-photo source')).toHaveAttribute('srcset', '/pennybacker-960.jpg')
    expect(screen.getByText('Independent community guide · Not a City of Austin service')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Pennybacker Bridge · Photo: Haythemhammour' })).toHaveAttribute(
      'href', 'https://commons.wikimedia.org/wiki/File:Pennybacker_Bridge_September_2018.jpg',
    )
    expect(screen.getByRole('link', { name: 'CC0 · Cropped for display' })).toHaveAttribute(
      'href', 'https://creativecommons.org/publicdomain/zero/1.0/',
    )
  })

  it('connects the landing to nearby help, programs and saved steps without duplicate shortcuts', async () => {
    render(<App />)
    const user = userEvent.setup()
    expect(screen.queryByRole('button', { name: /Find help close to home/ })).not.toBeInTheDocument()
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Nearby' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Find help nearby' })).toBeVisible()
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Find help' }))
    await user.click(screen.getByRole('button', { name: 'All programs' }))
    expect(screen.getByRole('heading', { level: 1, name: 'All programs' })).toBeVisible()
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Find help' }))
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'My steps' }))
    expect(screen.getByRole('heading', { level: 1, name: 'My steps' })).toBeVisible()
  })

  it('requires editable confirmation and keeps a new description separate from the previous household', async () => {
    render(<App />)
    const user = await describeNeed('family of 4, income $600 per week, rent help, ZIP 78741')
    expect(screen.getByRole('heading', { name: 'Check what we understood' })).toBeVisible()
    expect(screen.getByLabelText('How many people are in your household?')).toHaveValue(4)
    expect(screen.getByLabelText('Amount in dollars')).toHaveValue(2600)
    expect(screen.getByLabelText('ZIP code (optional)')).toHaveValue('78741')
    expect(screen.getByLabelText('Do you live in Travis County?')).toHaveValue('')
    expect(screen.queryByRole('heading', { name: 'Support worth exploring' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Find help' }))
    await describeNeed('I need food')
    expect(screen.getByLabelText('How many people are in your household?')).toHaveValue(null)
    expect(screen.getByLabelText('Amount in dollars')).toHaveValue(null)
    expect(screen.getByLabelText('ZIP code (optional)')).toHaveValue('')
    expect(window.location.hash).not.toMatch(/78741|2600|income/)
    expect(window.localStorage.length).toBe(0)
  })

  it('shows only three recommendations initially, and allows more', async () => {
    const { container } = render(<App />)
    const user = await describeNeed('I need help')
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    await user.click(screen.getByRole('button', { name: /All matches/ }))
    expect(container.querySelectorAll('.program-card')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: /Show more/ }))
    expect(container.querySelectorAll('.program-card')).toHaveLength(6)
    expect(screen.queryByText('Open to all')).not.toBeInTheDocument()
  })

  it('allows a need-only route without forcing optional household questions', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Transportation' }))
    await user.click(screen.getByRole('button', { name: 'Show options with what I have shared' }))
    expect(screen.getByRole('heading', { name: 'Support worth exploring' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'CapMetro Bus and Rail Trip Planning' })).toBeVisible()
    expect(localStorage.length).toBe(0)
  })

  it('keeps long confirmation requirements expandable rather than filling every card', async () => {
    const { container } = render(<App />)
    const user = await describeNeed('I need food')
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    await user.click(screen.getByRole('button', { name: /All matches/ }))
    const details = container.querySelector('.program-card details')
    expect(details).not.toHaveAttribute('open')
    expect(details?.querySelector('summary')).toHaveTextContent('Still to confirm')
    expect(screen.getAllByRole('button', { name: /View details & next steps:/ })).toHaveLength(3)
  })

  it('restores modal focus, traps Tab, and supports Escape and history back', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'More' }))
    await user.click(screen.getByRole('button', { name: 'All programs' }))
    const opener = screen.getAllByRole('button', { name: /View details & next steps:/ })[0]
    await user.click(opener)
    const dialog = screen.getByRole('dialog')
    const close = within(dialog).getByRole('button', { name: 'Close details' })
    expect(close).toHaveFocus()
    expect(document.querySelector('.app-shell')).toHaveAttribute('inert')
    await user.tab({ shift: true })
    expect(dialog.contains(document.activeElement)).toBe(true)
    expect(close).not.toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(opener).toHaveFocus()
    await user.click(opener)
    window.history.back()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('heading', { name: 'All programs' })).toBeVisible()
  })

  it('switches introduced navigation, form and nearby labels into Spanish', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Español' }))
    expect(document.documentElement.lang).toBe('es')
    expect(screen.getByRole('heading', { name: 'Austin tiene apoyo. Encuentre el suyo.' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Cuéntenos qué necesita' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Cerca' }))
    expect(screen.getByRole('heading', { name: 'Encuentre ayuda cerca' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Cargar mapa opcional' })).toBeVisible()
  })

  it('makes reviewed common terms available in More without duplicate field IDs', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'More' }))
    await user.click(screen.getByText('Explain common terms'))
    const term = screen.getByLabelText('Which term would you like explained?')
    await user.selectOptions(term, 'gross-income')
    expect(screen.getByRole('status')).toHaveTextContent('before taxes or payroll deductions')
    expect(document.querySelectorAll('#benefit-term')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Español' }))
    expect(screen.getByLabelText('¿Qué término quiere entender?')).toBeVisible()
    expect(screen.getByRole('status')).toHaveTextContent('antes de impuestos')
  })

  it('starts nearby as five readable places without requesting geolocation or loading tiles', async () => {
    const getCurrentPosition = vi.fn()
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition } })
    const { container } = render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Nearby' }))
    expect(container.querySelectorAll('.place-list > article')).toHaveLength(5)
    expect(container.querySelector('.help-map')).not.toBeInTheDocument()
    expect(getCurrentPosition).not.toHaveBeenCalled()
    expect(screen.getByText(/origin with OpenStreetMap/)).toBeVisible()
    expect(screen.getByText(/Historical directory, not live availability/)).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Housing inventory — not vacancies' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Find property contacts with the City housing search' })).toHaveAttribute('href', 'https://www.austintexas.gov/housing/programs/affordable-housing-online-search-tool-ahost')
  })

  it.each([
    ['I cannot breathe', 'tel:911'],
    ['I want to kill myself', 'tel:988'],
    ['My partner is hitting me right now', 'tel:+18007997233'],
  ])('routes urgent wording away from ordinary lists: %s', async (text, link) => {
    const { container } = render(<App />)
    await describeNeed(text)
    expect(screen.getByRole('heading', { name: 'Get urgent help now' })).toBeVisible()
    expect(container.querySelector(`a[href="${link}"]`)).toBeInTheDocument()
    expect(container.querySelectorAll('.program-card, .place-card')).toHaveLength(0)
    expect(window.location.hash).toBe('#urgent')
  })

  it('clears answers and navigation without adding personal information to history', async () => {
    render(<App />)
    const user = await describeNeed('family of 4, income $2000 per month')
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    await user.click(screen.getByRole('button', { name: 'Clear answers & start over' }))
    expect(screen.getByRole('textbox', { name: 'Tell us what you need' })).toHaveValue('')
    expect(window.location.hash).toBe('#find')
    window.history.pushState({}, '', '#results')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Support worth exploring' })).toBeVisible())
    expect(screen.queryByRole('button', { name: /View details & next steps:/ })).not.toBeInTheDocument()
  })

  it('requires an explicit voice disclosure and keeps denial on the typing path', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByText('Privacy & voice options'))
    await user.click(screen.getByRole('button', { name: 'Use voice' }))
    expect(screen.getByText(/may send audio to its speech provider/)).toBeVisible()
    expect(startDictation).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Keep typing instead' }))
    expect(startDictation).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Use voice' }))
    await user.click(screen.getByRole('button', { name: 'Allow voice processing' }))
    expect(startDictation).toHaveBeenCalledWith('en', expect.any(Object), { consentToRemote: true })
  })

  it('does not stay listening after a synchronous voice failure and keeps errors in Spanish', async () => {
    vi.mocked(startDictation).mockImplementationOnce((_language, handlers) => {
      handlers.onError?.()
      return null
    })
    render(<VoiceInput language="es" onText={vi.fn()} />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Usar voz' }))
    await user.click(screen.getByRole('button', { name: 'Permitir procesamiento de voz' }))
    expect(screen.getByRole('alert')).toHaveTextContent('La voz no funcionó')
    expect(screen.getByRole('button', { name: 'Usar voz' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Dejar de escuchar' })).not.toBeInTheDocument()
  })

  it('saves only an opted-in program checklist and lets the user delete it', async () => {
    render(<App />)
    const user = await describeNeed('family of 4, income $2000 per month, I need food')
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    await user.click(screen.getAllByRole('button', { name: /View details & next steps:/ })[0])
    expect(window.localStorage.getItem(STEPS_KEY)).toBeNull()
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/Anyone using it may see them/)).toBeVisible()
    await user.click(within(dialog).getByRole('button', { name: 'Save steps on this device' }))
    const record = JSON.parse(window.localStorage.getItem(STEPS_KEY)!)
    expect(Object.keys(record.entries[0]).sort()).toEqual(['completed', 'programId'])
    expect(record.entries[0].completed).toEqual([])
    expect(window.localStorage.getItem(STEPS_KEY)).not.toMatch(/2000|monthlyIncome|family of/)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'My steps' }))
    const step = screen.getAllByRole('checkbox')[0]
    await user.click(step)
    expect(JSON.parse(window.localStorage.getItem(STEPS_KEY)!).entries[0].completed).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Delete saved plan' }))
    expect(JSON.parse(window.localStorage.getItem(STEPS_KEY)!).entries).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Yes, delete saved plan' }))
    expect(screen.getByText(/No steps saved yet/)).toBeVisible()
  })

  it('preserves unreadable saved plans until deletion is explicitly confirmed', async () => {
    window.localStorage.setItem(STEPS_KEY, '{unreadable')
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'My steps' }))
    expect(screen.getByRole('alert')).toHaveTextContent('They have not been overwritten')
    await user.click(screen.getByRole('button', { name: 'Delete saved plan' }))
    await user.click(screen.getByRole('button', { name: 'Keep saved plan' }))
    expect(window.localStorage.getItem(STEPS_KEY)).toBe('{unreadable')
    await user.click(screen.getByRole('button', { name: 'Delete saved plan' }))
    await user.click(screen.getByRole('button', { name: 'Yes, delete saved plan' }))
    expect(screen.getByText(/No steps saved yet/)).toBeVisible()
  })
})

describe('optional household questions', () => {
  it('starts size unknown, distinguishes no from unknown, and does not treat expenses as income', async () => {
    const submit = vi.fn()
    const initial = { ...emptyHousehold(), isRenter: true }
    render(<HouseholdFlow language="en" initial={initial} confirmation inferred={['isRenter']} onSubmit={submit} onCancel={vi.fn()} />)
    const user = userEvent.setup()
    expect(screen.getByLabelText('How many people are in your household?')).toHaveValue(null)
    const renter = screen.getByLabelText('Do you rent your home?')
    await user.selectOptions(renter, 'false')
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    expect(submit.mock.lastCall?.[0].isRenter).toBe(false)
    await user.selectOptions(renter, 'unknown')
    await user.selectOptions(screen.getByLabelText('This amount is'), 'expense')
    await user.type(screen.getByLabelText('Amount in dollars'), '1400')
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    expect(submit.mock.lastCall?.[0]).toMatchObject({ size: null, isRenter: null, monthlyIncome: null })
    await user.selectOptions(renter, 'prefer')
    expect(renter).toHaveValue('prefer')
  })

  it('offers a compact one-question guided flow with no default household size', async () => {
    render(<HouseholdFlow language="en" initial={emptyHousehold()} confirmation={false} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    const user = userEvent.setup()
    expect(screen.queryByLabelText('Amount in dollars')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByLabelText('How many people are in your household?')).toHaveValue(null)
    await user.click(screen.getByRole('button', { name: 'Not sure' }))
    expect(screen.getByRole('button', { name: 'Not sure' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByLabelText('Amount in dollars')).toHaveValue(null)
  })
})

describe('personalized plans, pathways and money check', () => {
  it('turns a life situation into a confirmed, phased plan that saves in one step', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Behind on rent or facing eviction/ }))
    expect(screen.getByRole('heading', { name: 'Key things to know first' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'TexasLawHelp: Appealing an Eviction' })).toHaveAttribute('href', 'https://texaslawhelp.org/article/appealing-an-eviction')
    await user.click(screen.getByRole('button', { name: 'Build my plan' }))
    expect(screen.getByRole('heading', { name: 'Check what we understood' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    expect(screen.getByRole('heading', { name: 'Your step-by-step plan' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Today: get steady' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Texas Eviction Guides and Court Forms' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Save this whole plan to My steps' }))
    const saved = JSON.parse(localStorage.getItem(STEPS_KEY)!).entries
    expect(saved.length).toBeGreaterThan(1)
    expect(saved.every((entry: { completed: string[] }) => entry.completed.length === 0)).toBe(true)
    expect(screen.getByRole('status')).toHaveTextContent('Plan saved')
    await user.click(screen.getByRole('button', { name: 'Open My steps' }))
    expect(screen.getByText(`0 / ${document.querySelectorAll('.check-step').length}`)).toBeVisible()
    expect(screen.getByText('Next up')).toBeVisible()
  })

  it('offers a quick exit on the unsafe-home pathway without storing anything', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Not safe at home/ }))
    expect(screen.getAllByRole('button', { name: 'Quick exit' }).length).toBeGreaterThan(0)
    expect(localStorage.getItem(STEPS_KEY)).toBeNull()
  })

  it('checks a monthly budget privately and points to help for the largest costs', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /See where your money goes/ }))
    await user.type(screen.getByLabelText('Monthly take-home income for the household'), '2000')
    await user.type(screen.getByLabelText('Rent or mortgage'), '1100')
    await user.type(screen.getByLabelText('Groceries'), '400')
    expect(screen.getByText('Left each month')).toBeVisible()
    expect(screen.getByText(/HUD calls this a severe cost burden/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'View details & next steps: SNAP Food Benefits' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Build a plan for these costs' }))
    expect(screen.getByRole('heading', { name: 'A little more about your needs' })).toBeVisible()
    expect(localStorage.getItem(STEPS_KEY)).toBeNull()
  })

  it('shows a call script inside program details', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'More' }))
    await user.click(screen.getByRole('button', { name: 'All programs' }))
    await user.click(screen.getByRole('button', { name: 'View details & next steps: SNAP Food Benefits' }))
    await user.click(within(screen.getByRole('dialog')).getByText('Prepare for your call'))
    expect(within(screen.getByRole('dialog')).getByText(/I'm calling about SNAP Food Benefits/)).toBeVisible()
  })
})

describe('career and résumé builder', () => {
  it('turns past work into matched pathways and a résumé without saving anything', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Career' }))
    expect(screen.getByRole('heading', { name: 'Career & résumé builder' })).toBeVisible()
    await user.type(screen.getByLabelText('Job title'), 'Line cook')
    expect(screen.getByText('Food safety')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Food & hospitality' }))
    await user.click(screen.getByRole('button', { name: 'See my pathways' }))
    expect(screen.getByRole('heading', { name: 'Food service & hospitality' })).toBeVisible()
    expect(screen.getAllByRole('link', { name: /Pay and job outlook/ })[0]).toHaveAttribute('href', 'https://www.onetonline.org/link/summary/11-9051.00')
    await user.click(screen.getByRole('button', { name: 'Build my résumé' }))
    await user.type(screen.getByLabelText('Full name'), 'Sam Lee')
    expect(within(screen.getByRole('article', { name: 'Preview' })).getByText('Sam Lee')).toBeVisible()
    expect(within(screen.getByRole('article', { name: 'Preview' })).getAllByText('Line cook').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Download for Word' })).toBeEnabled()
    expect(localStorage.length).toBe(0)
  })

  it('reaches the career builder from the new-career pathway', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Want a better job or a new career/ }))
    await user.click(screen.getByRole('button', { name: 'Open the career builder' }))
    expect(screen.getByRole('heading', { name: 'Career & résumé builder' })).toBeVisible()
  })
})

describe('fresh-start tools', () => {
  it('keeps the home page calm and reveals every life situation on request', async () => {
    render(<App />)
    const user = userEvent.setup()
    const grid = document.getElementById('pathway-grid')!
    expect(within(grid).getAllByRole('button')).toHaveLength(8)
    expect(within(grid).getByRole('button', { name: /Not safe at home/ })).toBeVisible()
    await user.click(screen.getByRole('button', { name: /Show all situations/ }))
    expect(within(grid).getByRole('button', { name: /Aging out of foster care/ })).toBeVisible()
    expect(within(grid).getByRole('button', { name: /Start or grow a small business/ })).toBeVisible()
  })

  it('coaches interview answers with the STAR structure', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Career' }))
    await user.click(screen.getByRole('button', { name: /Interview practice/ }))
    await user.click(screen.getByRole('button', { name: /solved a problem at work/ }))
    await user.type(screen.getByLabelText('Situation'), 'Our register system crashed at lunch.')
    await user.type(screen.getByLabelText('Result'), 'We served 40 customers without delay.')
    expect(screen.getByText('Our register system crashed at lunch. We served 40 customers without delay.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /talk about a criminal record/ }))
    expect(screen.getByText(/Some records can be sealed/)).toBeVisible()
    expect(localStorage.length).toBe(0)
  })

  it('plans a debt payoff privately and compares it with minimum payments', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /See where your money goes/ }))
    await user.type(screen.getByLabelText('Balance ($)', { selector: '#debt-balance-0' }), '1000')
    await user.type(screen.getByLabelText('Interest rate (APR %)', { selector: '#debt-apr-0' }), '24')
    await user.type(screen.getByLabelText('Minimum payment ($/month)', { selector: '#debt-min-0' }), '40')
    await user.type(screen.getByLabelText('Extra you can pay each month ($)'), '60')
    expect(screen.getByText('Debt-free in')).toBeVisible()
    expect(screen.getByText('Interest saved vs. minimums')).toBeVisible()
    expect(localStorage.length).toBe(0)
  })
})

describe('calm interface', () => {
  it('has no top strip, keeps the independent notice in the footer and hides unavailable AI', () => {
    render(<App />)
    expect(document.querySelector('.civic-strip')).toBeNull()
    expect(within(screen.getByRole('contentinfo')).getByText('Independent community guide · Not a City of Austin service')).toBeVisible()
    expect(screen.queryByText('Another way to start')).not.toBeInTheDocument()
  })

  it('shows every directory program with one tap', async () => {
    const { container } = render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'All programs' }))
    await user.click(screen.getByRole('button', { name: /^Show all/ }))
    expect(container.querySelectorAll('.program-card')).toHaveLength(68)
  })

  it('lets people browse skill types, search, and add their own skills', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Career' }))
    await user.type(screen.getByLabelText('Job title'), 'Cashier')
    await user.click(screen.getByRole('button', { name: 'See my pathways' }))
    await user.click(screen.getByRole('button', { name: 'Build my résumé' }))
    await user.click(screen.getByRole('button', { name: 'Trades & safety' }))
    await user.click(screen.getByRole('button', { name: 'Forklift operation' }))
    expect(screen.getByRole('button', { name: 'Remove skill: Forklift operation' })).toBeVisible()
    await user.type(screen.getByLabelText('Search all skills'), 'cpr')
    await user.click(screen.getByRole('button', { name: 'CPR and First Aid' }))
    await user.type(screen.getByLabelText('Type a skill, e.g. Spanish interpreting'), 'Sign language{Enter}')
    const preview = screen.getByRole('article', { name: 'Preview' })
    expect(within(preview).getByText(/Forklift operation • CPR and First Aid • Sign language/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Remove skill: Sign language' }))
    expect(within(preview).queryByText(/Sign language/)).not.toBeInTheDocument()
  })
})

describe('saved steps across rounds', () => {
  it('merges a second situation into My steps, grouped by phase, without duplicates', async () => {
    render(<App />)
    const user = userEvent.setup()
    for (const situation of [/Lost my job or my hours were cut/, /Behind on rent or facing eviction/]) {
      await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Find help' }))
      await user.click(screen.getByRole('button', { name: situation }))
      await user.click(screen.getByRole('button', { name: 'Build my plan' }))
      await user.click(screen.getByRole('button', { name: 'Find support options' }))
      await user.click(screen.getByRole('button', { name: 'Save this whole plan to My steps' }))
    }
    const ids: string[] = JSON.parse(localStorage.getItem(STEPS_KEY)!).entries.map((entry: { programId: string }) => entry.programId)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(expect.arrayContaining(['unemployment', 'eviction-legal-info']))
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'My steps' }))
    const today = screen.getByRole('region', { name: 'Today: get steady' })
    expect(within(today).getByRole('heading', { name: 'Texas Eviction Guides and Court Forms' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'This week: apply' })).toBeVisible()
  })

  it('asks before clearing saved steps and can clear everything', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Lost my job or my hours were cut/ }))
    await user.click(screen.getByRole('button', { name: 'Build my plan' }))
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    await user.click(screen.getByRole('button', { name: 'Save this whole plan to My steps' }))
    await user.click(screen.getByRole('button', { name: 'Clear answers & start over' }))
    expect(screen.getByText(/You also have \d+ saved services in My steps/)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Clear answers and My steps' }))
    expect(JSON.parse(localStorage.getItem(STEPS_KEY)!).entries).toHaveLength(0)
    expect(screen.getByRole('heading', { level: 1, name: /Austin has support/ })).toBeVisible()
  })

  it('starts over immediately when nothing is saved', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Clear answers & start over' }))
    expect(screen.queryByText(/saved services in My steps/)).not.toBeInTheDocument()
  })
})

describe('consolidated My steps', () => {
  it('shows one next step at a time and advances it when marked done', async () => {
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Lost my job or my hours were cut/ }))
    await user.click(screen.getByRole('button', { name: 'Build my plan' }))
    await user.click(screen.getByRole('button', { name: 'Find support options' }))
    await user.click(screen.getByRole('button', { name: 'Save this whole plan to My steps' }))
    await user.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'My steps' }))
    const card = () => document.querySelector('.next-up-card')!
    const first = card().querySelector('h2')!.textContent
    await user.click(screen.getByRole('button', { name: 'Mark done' }))
    expect(card().querySelector('h2')!.textContent).not.toBe(first)
    expect(screen.getByText(/^1 \/ \d+$/)).toBeVisible()
    expect(document.querySelectorAll('details.saved-program[open]')).toHaveLength(1)
  })
})
