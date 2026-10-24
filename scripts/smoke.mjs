import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'

const base = process.env.BENEFITS_BASE_URL ?? 'http://127.0.0.1:4173'
const browser = await chromium.launch({ channel: process.env.BENEFITS_BROWSER ?? 'msedge', headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const report = name => console.log(`PASS: ${name}`)
const navigate = async hash => {
  await page.goto(`${base}/${hash ? `#${hash}` : ''}`)
  await page.getByRole('heading', { level: 1 }).first().waitFor()
}
const describeNeed = async text => {
  await navigate('')
  await page.getByRole('textbox', { name: 'Tell us what you need', exact: true }).fill(text)
  await page.getByRole('button', { name: 'Review my information', exact: true }).click()
}

try {
  const status = await context.request.get(`${base}/api/ai/status`)
  assert.equal(status.status(), 200)
  assert.match(status.headers()['cache-control'], /no-store/)
  report('server API exposes a no-cache status without credentials')

  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 })
    for (const view of ['', 'nearby', 'more', 'directory']) {
      await navigate(view)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${view} overflows at ${width}`)
    }
    await navigate('')
    const cta = await page.locator('.main-cta').boundingBox()
    assert.ok(cta && cta.y + cta.height < 760, `main action is buried at ${width}`)
    assert.ok(cta.height >= 44)
    assert.equal(await page.locator('textarea').evaluate(element => getComputedStyle(element).fontSize), '16px')
    const photo = await page.locator('.hero-photo img').evaluate(async image => {
      await image.decode()
      return { source: image.currentSrc, width: image.naturalWidth }
    })
    assert.equal(new URL(photo.source).origin, new URL(base).origin)
    assert.equal(photo.width, width <= 700 ? 960 : 1920)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  report('main action visible, touch-sized, and 320/390/768/1280 layouts fit')

  await page.getByRole('button', { name: 'Español', exact: true }).click()
  await page.getByRole('heading', { name: 'Austin tiene apoyo. Encuentre el suyo.', exact: true }).waitFor()
  const spanishCta = await page.locator('.main-cta').boundingBox()
  assert.ok(spanishCta && spanishCta.y + spanishCta.height < 760)
  await page.getByRole('button', { name: 'English', exact: true }).click()
  await page.getByRole('button', { name: 'Use dark theme', exact: true }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
  await page.getByRole('button', { name: 'Use light theme', exact: true }).click()
  await page.getByRole('navigation').getByRole('button', { name: 'Nearby', exact: true }).click()
  await page.getByRole('heading', { name: 'Find help nearby', exact: true }).waitFor()
  await navigate('')
  await page.getByRole('button', { name: 'All programs', exact: true }).click()
  await page.getByRole('heading', { name: 'All programs', exact: true }).waitFor()
  await navigate('')
  await page.getByRole('navigation').getByRole('button', { name: 'My steps', exact: true }).click()
  await page.getByRole('heading', { name: 'My steps', exact: true }).waitFor()
  report('local responsive bridge photograph, translated civic hero, dark theme and primary destinations')

  const fallbackContext = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } })
  const fallbackPage = await fallbackContext.newPage()
  await fallbackPage.route('**/pennybacker-*.jpg', route => route.abort())
  await fallbackPage.goto(base)
  await fallbackPage.getByRole('textbox', { name: 'Tell us what you need', exact: true }).fill('I need food')
  await fallbackPage.getByRole('button', { name: 'Review my information', exact: true }).click()
  await fallbackPage.getByRole('heading', { name: 'Check what we understood', exact: true }).waitFor()
  await fallbackContext.close()
  report('missing hero photograph never blocks the help form')

  await describeNeed('I do not have children and I am not pregnant. My rent is $1800 and I earn $2400 a month.')
  assert.equal(await page.getByLabel('Amount in dollars', { exact: true }).inputValue(), '2400')
  assert.equal(await page.locator('#flag-hasChildrenUnder18').inputValue(), 'false')
  assert.equal(await page.locator('#flag-hasChildUnder5OrPregnant').inputValue(), 'false')
  assert.equal(await page.getByLabel('Do you live in Travis County?', { exact: true }).inputValue(), '')
  await page.getByRole('button', { name: 'Find support options', exact: true }).click()
  await page.getByRole('heading', { name: 'Your step-by-step plan', exact: true }).waitFor()
  await page.getByRole('button', { name: /^All matches/ }).click()
  assert.equal(await page.locator('.program-card').count(), 3)
  assert.equal(await page.locator('.program-card details[open]').count(), 0)
  const cardHeight = await page.locator('.program-card').first().evaluate(element => element.getBoundingClientRect().height)
  assert.ok(cardHeight < 610, `first card is too long: ${cardHeight}`)
  await describeNeed('I need food')
  assert.equal(await page.getByLabel('Amount in dollars', { exact: true }).inputValue(), '')
  assert.equal(await page.getByLabel('How many people are in your household?', { exact: true }).inputValue(), '')
  await page.getByRole('button', { name: 'Find support options', exact: true }).click()
  await page.getByRole('heading', { name: 'Your step-by-step plan', exact: true }).waitFor()
  await page.getByRole('button', { name: /^All matches/ }).click()
  assert.ok((await page.locator('.program-card h2').allTextContents()).some(value => value.includes('Central Texas Food Bank')))
  report('negation, income role, fresh households, top-three relevance and compact cards')

  await page.locator('.program-card').first().getByRole('button').click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  assert.equal(await page.getByRole('button', { name: 'Close details', exact: true }).evaluate(element => element === document.activeElement), true)
  await page.keyboard.press('Shift+Tab')
  assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))), true)
  await dialog.getByRole('button', { name: 'Save steps on this device', exact: true }).click()
  await page.getByRole('button', { name: 'Close details', exact: true }).click()
  await dialog.waitFor({ state: 'hidden' })
  await page.getByRole('navigation').getByRole('button', { name: 'My steps', exact: true }).click()
  await page.getByRole('checkbox').first().check()
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('austin-benefits:steps:v1')))
  assert.deepEqual(Object.keys(saved).sort(), ['entries', 'version'])
  assert.deepEqual(Object.keys(saved.entries[0]).sort(), ['completed', 'programId'])
  const downloadEvent = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download plan', exact: true }).click()
  const download = await downloadEvent
  const stream = await download.createReadStream()
  let downloadText = ''
  for await (const chunk of stream) downloadText += chunk.toString()
  assert.ok(downloadText.includes('[x]'))
  assert.ok(downloadText.includes('No household answers are included.'))
  await page.reload()
  assert.equal(await page.getByRole('checkbox').first().isChecked(), true)
  await page.getByRole('button', { name: 'Delete saved plan', exact: true }).click()
  await page.getByRole('button', { name: 'Keep saved plan', exact: true }).click()
  assert.equal(await page.getByRole('checkbox').first().isChecked(), true)
  report('accessible modal, opted-in IDs-only plan, export and refresh persistence')

  await page.getByRole('navigation').getByRole('button', { name: 'Find help', exact: true }).click()
  assert.equal(await page.locator('.hero-photo img').evaluate(async image => { await image.decode(); return image.naturalWidth > 0 }), true)
  await page.getByRole('button', { name: 'Transportation', exact: true }).click()
  await page.getByRole('button', { name: 'Show options with what I have shared', exact: true }).click()
  assert.equal(await page.getByRole('heading', { name: 'CapMetro Bus and Rail Trip Planning', exact: true }).isVisible(), true)
  await navigate('nearby')
  assert.equal(await page.locator('.place-list > .place-card').count(), 5)
  assert.equal(await page.locator('.leaflet-container').count(), 0)
  await page.getByLabel('ZIP code (optional)', { exact: true }).fill('78758')
  await page.getByRole('button', { name: 'Find near this ZIP', exact: true }).click()
  assert.ok((await page.locator('.place-card .eyebrow').first().innerText()).includes('mi'))
  await page.getByRole('button', { name: 'Español', exact: true }).click()
  assert.equal(await page.getByRole('heading', { name: 'Encuentre ayuda cerca', exact: true }).isVisible(), true)
  await page.getByRole('button', { name: 'English', exact: true }).click()
  report('need-only shortcut, list-first nearby, ZIP and Spanish')

  // Never pan/zoom against volunteer tile servers in automated tests.
  const mapContext = await browser.newContext({ serviceWorkers: 'block' })
  const mapPage = await mapContext.newPage()
  let tileStatus = 403
  let tileRequests = 0
  await mapPage.route('https://tile.openstreetmap.org/**', async route => {
    tileRequests++
    const headers = await route.request().allHeaders()
    assert.equal(headers.referer, `${new URL(base).origin}/`)
    assert.ok(!headers['cache-control']?.includes('no-cache'))
    await route.fulfill({
      status: tileStatus,
      contentType: 'image/png',
      headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'max-age=604800' },
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6ioAAAAASUVORK5CYII=', 'base64'),
    })
  })
  await mapPage.goto(`${base}/#nearby`)
  await mapPage.getByRole('button', { name: 'Load optional map', exact: true }).click()
  await mapPage.getByText(/The map provider is unavailable or blocked the tiles/).waitFor()
  assert.equal(await mapPage.locator('.leaflet-container').count(), 0)
  assert.equal(await mapPage.locator('.place-list > .place-card').count(), 5)
  const stoppedRequests = tileRequests
  await new Promise(resolve => setTimeout(resolve, 400))
  assert.equal(tileRequests, stoppedRequests)
  tileStatus = 200
  await mapPage.getByRole('button', { name: 'Retry map', exact: true }).click()
  await mapPage.locator('.leaflet-tile-loaded').first().waitFor()
  assert.equal(await mapPage.locator('.leaflet-container').count(), 1)
  assert.ok(tileRequests > stoppedRequests)
  await mapContext.close()
  report('map uses origin-only identification, rejects blocked PNGs, stops on error and retries explicitly')

  for (const [description, target] of [
    ['I am having heatstroke', 'tel:911'],
    ['I want to kill myself', 'tel:988'],
    ['My partner is hitting me right now', 'tel:911'],
  ]) {
    await describeNeed(description)
    assert.equal(await page.locator(`a[href="${target}"]`).first().isVisible(), true)
    assert.equal(await page.locator('.program-card, .place-card').count(), 0)
  }
  report('urgent situations bypass ordinary benefit and place lists')

  await navigate('')
  await page.getByRole('button', { name: 'Pets & vet care', exact: true }).click()
  await page.getByRole('button', { name: 'Show options with what I have shared', exact: true }).click()
  await page.getByRole('button', { name: /^All matches/ }).click()
  assert.equal(await page.getByRole('heading', { name: 'Emancipet Low-Cost Veterinary Clinics', exact: true }).isVisible(), true)
  assert.equal(await page.locator('.program-card').count(), 3)
  assert.equal(await page.getByText('Austin Humane Society Pet Food Pantry — Paused', { exact: true }).count(), 0)
  await page.getByRole('button', { name: /Show more/ }).click()
  assert.equal(await page.getByRole('heading', { name: 'Austin Humane Society Pet Food Pantry — Paused', exact: true }).isVisible(), true)
  await page.getByRole('button', { name: 'View details & next steps: Emancipet Low-Cost Veterinary Clinics', exact: true }).click()
  await page.getByRole('button', { name: 'Save steps on this device', exact: true }).click()
  await page.getByRole('button', { name: 'Close details', exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  await page.getByRole('navigation').getByRole('button', { name: 'My steps', exact: true }).click()
  assert.equal(await page.getByRole('heading', { name: 'Emancipet Low-Cost Veterinary Clinics', exact: true }).isVisible(), true)
  await describeNeed('My dog cannot breathe')
  assert.equal(await page.getByRole('heading', { name: 'Urgent veterinary care', exact: true }).isVisible(), true)
  assert.equal(await page.locator('a[href="tel:911"]').count(), 0)
  await navigate('')
  await page.getByRole('button', { name: 'Español', exact: true }).click()
  assert.equal(await page.getByRole('button', { name: 'Mascotas y veterinaria', exact: true }).isVisible(), true)
  await page.getByRole('button', { name: 'English', exact: true }).click()
  report('bilingual pet category, five sourced options, paused pantry, saved steps and veterinary urgency')

  await navigate('')
  if (!(await status.json()).available) {
    await page.getByRole('heading', { name: /Going through something/ }).waitFor()
    assert.equal(await page.getByText('Another way to start', { exact: true }).count(), 0)
  }
  await navigate('more')
  await page.getByText('Explain common terms', { exact: true }).click()
  await page.getByLabel('Which term would you like explained?', { exact: true }).selectOption('fpl')
  assert.ok((await page.locator('.common-terms').innerText()).includes('TANF, SSI'))
  report('unavailable AI stays out of the way, and offline-capable common-term explanations')

  const aiContext = await browser.newContext()
  const aiPage = await aiContext.newPage()
  let posted = 0
  await aiPage.route('**/api/ai/status', route => route.fulfill({ json: { available: true, provider: 'mock-provider.test' } }))
  await aiPage.route('**/api/ai/navigate', route => {
    posted++
    assert.deepEqual(route.request().postDataJSON(), { text: 'Help with getting to work', language: 'en', consent: true })
    return route.fulfill({ json: { needs: ['transportation'], confidence: 'high' } })
  })
  await aiPage.goto(base)
  await aiPage.getByRole('textbox', { name: 'Tell us what you need', exact: true }).fill('Help with getting to work')
  await aiPage.getByText('Another way to start', { exact: true }).click()
  await aiPage.getByRole('button', { name: 'Optional AI help understanding my request', exact: true }).click()
  const send = aiPage.getByRole('button', { name: 'Send to AI and review suggestions', exact: true })
  assert.equal(await send.isDisabled(), true)
  assert.equal(posted, 0)
  await aiPage.getByRole('checkbox', { name: 'I agree to send this description for this request.', exact: true }).check()
  await send.click()
  await aiPage.getByRole('button', { name: 'Use these needs and confirm details', exact: true }).click()
  await aiPage.getByRole('heading', { name: 'Check what we understood', exact: true }).waitFor()
  assert.equal(posted, 1)
  await aiContext.close()
  report('mock AI requires exact-text consent and explicit confirmation; no real model called')

  await navigate('steps')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller) {
      await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }))
    }
  })
  await page.reload()
  await page.waitForLoadState('networkidle')
  await context.setOffline(true)
  await page.reload()
  assert.equal(await page.getByRole('checkbox').first().isChecked(), true)
  await page.getByRole('navigation').getByRole('button', { name: 'Find help', exact: true }).click()
  assert.equal(await page.locator('.hero-photo img').evaluate(async image => { await image.decode(); return image.naturalWidth > 0 }), true)
  await page.getByRole('textbox', { name: 'Tell us what you need', exact: true }).fill('I need food')
  await page.getByRole('button', { name: 'Review my information', exact: true }).click()
  await page.getByRole('button', { name: 'Find support options', exact: true }).click()
  await page.getByRole('heading', { name: 'Your step-by-step plan', exact: true }).waitFor()
  await page.getByRole('button', { name: /^All matches/ }).click()
  assert.equal(await page.locator('.program-card').count(), 3)
  await context.setOffline(false)
  assert.deepEqual(errors, [])
  report('production offline reload restores steps and completes local matching')
} finally {
  await context.close()
  await browser.close()
}
