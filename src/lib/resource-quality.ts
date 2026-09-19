import type { Program } from '../types'

export function resourceFreshness(program: Program, asOf = new Date()): 'missing' | 'current-review' | 'review-needed' {
  if (!program.reviewedOn || !program.sources?.length) return 'missing'
  const reviewed = Date.parse(`${program.reviewedOn}T00:00:00Z`)
  const now = asOf.getTime()
  if (!Number.isFinite(reviewed) || !Number.isFinite(now) || reviewed > now) return 'review-needed'
  return now - reviewed > 90 * 86400000 ? 'review-needed' : 'current-review'
}

export function catalogIssues(programs: Program[], asOf = new Date()): string[] {
  const issues: string[] = []
  const ids = new Set<string>()
  for (const program of programs) {
    if (ids.has(program.id)) issues.push(`${program.id}: duplicate ID`)
    ids.add(program.id)
    if (!program.sources?.length) issues.push(`${program.id}: missing official sources`)
    if (resourceFreshness(program, asOf) !== 'current-review') issues.push(`${program.id}: source review is missing, stale, or future-dated`)
    if (!program.serviceArea || !program.actionKind || !program.applicationStatus) issues.push(`${program.id}: missing area, action type, or availability status`)
    if (!program.steps?.length) issues.push(`${program.id}: missing next steps`)
    if (new Set(program.steps?.map(step => step.id)).size !== program.steps?.length) issues.push(`${program.id}: duplicate or missing step identifiers`)
    const links = [program.applyOnlineUrl, program.localHelp?.url, ...(program.sources?.map(source => source.url) ?? [])].filter((link): link is string => Boolean(link))
    for (const link of links) {
      try {
        const url = new URL(link)
        if (url.protocol !== 'https:' || url.username || url.password) issues.push(`${program.id}: insecure source link`)
      } catch { issues.push(`${program.id}: invalid source link`) }
    }
    if ((program.applicationStatus === 'accepting' || program.applicationStatus === 'waitlist' || program.applicationStatus === 'closed') && !program.availabilityVerifiedOn) {
      issues.push(`${program.id}: dated evidence required for a specific application status`)
    }
  }
  return issues
}
