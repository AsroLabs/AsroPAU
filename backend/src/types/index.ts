// ============================================
// USUARIOS
// ============================================
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
  createdAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
}

// ============================================
// UNIVERSIDADES
// ============================================
export interface University {
  id: string;
  name: string;
  community: string;
  city: string;
  degrees: Degree[];
}

export interface Degree {
  id: string;
  universityId: string;
  name: string;
  cutoffGrade: number;
  field: 'Ciencias' | 'Letras' | 'Ingeniería' | 'Mixto';
}

// ============================================
// EXÁMENES
// ============================================
export interface OfficialExam {
  id: string;
  subject: string;
  convocation: "ordinary" | "extraordinary";
  year: number;
  location: string;
}

export interface Exam {
  id: string;
  userId: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  createdAt: Date;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface CreateExamDto {
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  quantity: number;
}

// ============================================
// CALCULADORA DE NOTAS
// ============================================
export interface ScoreCalculation {
  id: string;
  userId?: string;
  examGrade: number;
  bachelorGrade: number;
  specificSubjectsGrade?: number;
  finalScore: number;
  recommendations: University[];
  createdAt: Date;
}

export interface CalculateScoreDto {
  examGrade: number;
  bachelorGrade: number;
  specificSubjectsGrade?: number;
}

// ============================================
// RESPUESTAS API
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}