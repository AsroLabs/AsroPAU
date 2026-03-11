export { default as AcademicForm } from './components/AcademicForm.svelte'
export { default as GradeResults } from './components/GradeResults.svelte'
export { default as UniversityComparator } from './components/UniversityComparator.svelte'
export { default as NextSteps } from './components/NextSteps.svelte'

export type { Subject, University, Grade } from './types'
export {
  formatGrade,
  calculateNotaAcceso,
  calculateAdmisionPart,
  calculateTotalGrade,
  TRONCALES_OPTIONS,
  ADMISION_OPTIONS,
} from './lib'
