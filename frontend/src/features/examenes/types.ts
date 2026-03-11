export interface Exam {
  id: number
  region: string
  subject: string
  year: number
  session: string
  type: 'Ordinaria' | 'Extraordinaria'
}

export interface ExamsFilters {
  region: string
  subjects: string[]
  year: number | string
  convocatoria: string
}
