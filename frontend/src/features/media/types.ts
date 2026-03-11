export interface Subject {
  name: string
  grade: number
  weight: number
}

export interface University {
  degree: string
  city: string
  university: string
  cutOff: number
  logo: string
  status: 'dentro' | 'fuera'
  diff: number
  note: string
}

export interface Grade {
  id: number
  title: string
  location: string
  university: string
  cutOff: number
}
