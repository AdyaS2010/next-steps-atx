import type { Program } from '../types'
import { benefitPrograms } from './catalog-benefits'
import { servicePrograms } from './catalog-services'
import { petPrograms } from './catalog-pets'
import { legalPrograms } from './catalog-legal'
import { everydayPrograms } from './catalog-everyday'
import { careerPrograms } from './catalog-careers'
import { freshStartPrograms } from './catalog-fresh-start'

// Sources were read on the recorded dates. They do not establish live openings,
// funding, individual eligibility or a submitted application.
export const programs: Program[] = [...benefitPrograms, ...servicePrograms, ...legalPrograms, ...careerPrograms, ...freshStartPrograms, ...everydayPrograms, ...petPrograms]
