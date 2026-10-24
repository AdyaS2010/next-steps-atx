import type { Localized } from '../types'
import { text as t } from './catalog-shared'

/** Common interview questions with plain-language coaching. General guidance, not a script to memorize. */
export type InterviewQuestion = {
  id: string
  question: Localized
  why: Localized
  how: Localized
  /** Behavioral questions are best answered with the STAR structure. */
  star?: boolean
  sensitive?: boolean
}

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: 'about-you',
    question: t('Tell me about yourself.', 'Hábleme de usted.'),
    why: t('They want a short, work-focused introduction and a reason you fit this job.', 'Quieren una presentación breve y laboral, y una razón por la que encaja en el puesto.'),
    how: t('Use present, past, future: what you do now, one or two strengths from past work, and why this role is your next step. Aim for about one minute.', 'Use presente, pasado y futuro: lo que hace ahora, una o dos fortalezas de trabajos anteriores y por qué este puesto es su siguiente paso. Unos 60 segundos.'),
  },
  {
    id: 'why-job',
    question: t('Why do you want this job?', '¿Por qué quiere este trabajo?'),
    why: t('They are checking that you understand the role and will stay motivated.', 'Verifican que entiende el puesto y que se mantendrá motivado.'),
    how: t('Name something specific about the employer or the work, connect it to a skill you already have, and say what you want to learn.', 'Mencione algo específico del empleador o del trabajo, conéctelo con una habilidad que ya tiene y diga qué quiere aprender.'),
  },
  {
    id: 'problem',
    question: t('Tell me about a time you solved a problem at work.', 'Cuénteme de una vez que resolvió un problema en el trabajo.'),
    why: t('Past behavior is the best predictor of how you will handle problems here.', 'Lo que hizo antes es la mejor pista de cómo resolverá problemas aquí.'),
    how: t('Pick a real, specific example. Spend most of your answer on what you did, and end with a result, ideally a number.', 'Elija un ejemplo real y específico. Dedique la mayor parte a lo que usted hizo y termine con un resultado, idealmente con un número.'),
    star: true,
  },
  {
    id: 'difficult-person',
    question: t('Describe a time you dealt with a difficult customer or coworker.', 'Describa una vez que trató con un cliente o compañero difícil.'),
    why: t('They want to see patience, respect and problem solving under pressure.', 'Quieren ver paciencia, respeto y solución de problemas bajo presión.'),
    how: t('Stay positive about the other person. Show how you listened, stayed calm and found a solution.', 'Hable con respeto de la otra persona. Muestre cómo escuchó, mantuvo la calma y encontró una solución.'),
    star: true,
  },
  {
    id: 'strength',
    question: t('What is your greatest strength?', '¿Cuál es su mayor fortaleza?'),
    why: t('They want to know what you bring and whether you know yourself.', 'Quieren saber qué aporta y si se conoce bien.'),
    how: t('Choose one strength that matters for this job and prove it with a quick example.', 'Elija una fortaleza importante para este puesto y demuéstrela con un ejemplo breve.'),
  },
  {
    id: 'gap',
    question: t('Can you explain this gap in your work history?', '¿Puede explicar este periodo sin empleo?'),
    why: t('Gaps are common. They mostly want to know you are ready now.', 'Los periodos sin empleo son comunes. Sobre todo quieren saber que está listo ahora.'),
    how: t('Be brief and honest (caregiving, health, school, a move, a job search). Then pivot to what you did to stay sharp and why you are ready.', 'Sea breve y honesto (cuidado de familia, salud, estudios, mudanza, búsqueda de empleo). Luego hable de cómo se mantuvo activo y por qué está listo.'),
    sensitive: true,
  },
  {
    id: 'record',
    question: t('How do I talk about a criminal record?', '¿Cómo hablo de mis antecedentes penales?'),
    why: t('In Austin, many private employers cannot ask until after a conditional offer. When it comes up, they want honesty and evidence of change.', 'En Austin, muchos empleadores privados no pueden preguntar hasta después de una oferta condicional. Cuando surge, buscan honestidad y señales de cambio.'),
    how: t('Keep it short and factual, take responsibility without over-explaining, then focus on what you have done since: work, training, certificates, references. Check whether your record can be sealed first.', 'Sea breve y objetivo, asuma responsabilidad sin explicar de más y enfóquese en lo que ha hecho desde entonces: trabajo, capacitación, certificados, referencias. Revise primero si puede sellar su registro.'),
    sensitive: true,
  },
  {
    id: 'questions',
    question: t('Do you have any questions for us?', '¿Tiene alguna pregunta para nosotros?'),
    why: t('Asking good questions shows interest and helps you decide if the job fits you.', 'Hacer buenas preguntas muestra interés y le ayuda a decidir si el trabajo le conviene.'),
    how: t('Try: “What does a great first 90 days look like?”, “How is training done?”, or “What do you enjoy about working here?”', 'Pruebe: “¿Cómo serían unos excelentes primeros 90 días?”, “¿Cómo es la capacitación?” o “¿Qué le gusta de trabajar aquí?”.'),
  },
]

export const starParts: { key: 'situation' | 'task' | 'action' | 'result'; label: Localized; hint: Localized }[] = [
  { key: 'situation', label: t('Situation', 'Situación'), hint: t('Where were you and what was happening?', '¿Dónde estaba y qué pasaba?') },
  { key: 'task', label: t('Task', 'Tarea'), hint: t('What did you need to do?', '¿Qué necesitaba hacer?') },
  { key: 'action', label: t('Action', 'Acción'), hint: t('What did you do? Use “I”, not “we”.', '¿Qué hizo usted? Use “yo”, no “nosotros”.') },
  { key: 'result', label: t('Result', 'Resultado'), hint: t('What changed? Add a number if you can.', '¿Qué cambió? Agregue un número si puede.') },
]

export const interviewDayTips: Localized[] = [
  t('Research the employer for 10 minutes and write down one thing you like about them.', 'Investigue al empleador 10 minutos y anote algo que le guste de él.'),
  t('Print two copies of your résumé and bring a list of references with phone numbers.', 'Imprima dos copias de su currículum y lleve una lista de referencias con teléfonos.'),
  t('Plan your route (CapMetro Trip Planner) and aim to arrive 10 minutes early.', 'Planee su ruta (CapMetro Trip Planner) y llegue 10 minutos antes.'),
  t('Send a short thank-you message within a day.', 'Envíe un breve mensaje de agradecimiento dentro de un día.'),
]
