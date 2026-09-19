import { createServer } from 'vite'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { programs } = await vite.ssrLoadModule('/src/data/programs.ts')
  const { catalogIssues } = await vite.ssrLoadModule('/src/lib/resource-quality.ts')
  const dateArgument = process.argv.find(value => value.startsWith('--as-of='))
  const asOf = dateArgument ? new Date(`${dateArgument.slice(8)}T12:00:00Z`) : new Date()
  if (!Number.isFinite(asOf.getTime())) throw new Error('Use --as-of=YYYY-MM-DD')
  const issues = catalogIssues(programs, asOf)
  console.log(`Catalog: ${programs.length} programs; review date ${asOf.toISOString().slice(0, 10)}`)
  for (const issue of issues) console.log(`REVIEW: ${issue}`)
  if (process.argv.includes('--links')) {
    const urls = [...new Set(programs.flatMap(program => (program.sources ?? []).map(source => source.url)))]
    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000), redirect: 'follow' })
        if (!response.ok) console.log(`CHECK LINK (${response.status}): ${url}`)
      } catch { console.log(`CHECK LINK (unreachable): ${url}`) }
    }
  }
  console.log('A working link does not verify a benefit rule, intake status, opening hours, or vacancies. Review changed facts with the provider before publishing.')
  if (issues.length) process.exitCode = 1
} finally { await vite.close() }
