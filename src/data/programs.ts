import type { Program } from '../types'
import { benefitPrograms } from './catalog-benefits'
import { servicePrograms } from './catalog-services'
import { petPrograms } from './catalog-pets'

// Sources were read on the recorded dates. They do not establish live openings,
// funding, individual eligibility or a submitted application.
export const programs: Program[] = [...benefitPrograms, ...servicePrograms, ...petPrograms]
