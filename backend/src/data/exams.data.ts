import { Exam } from '../types';

export const examsData: Exam[] = [
  {
    id: '1',
    userId: '1',
    subject: 'Matemáticas',
    difficulty: 'medium',
    questions: [
      {
        id: 1,
        question: '¿Cuál es la derivada de x²?',
        options: ['2x', 'x', '2', 'x²'],
        correctAnswer: '2x',
        explanation: 'La derivada de x² es 2x aplicando la regla de potencias',
      },
      {
        id: 2,
        question: '¿Cuánto es la integral de 1/x?',
        options: ['ln(x)', 'x', '1/x²', 'e^x'],
        correctAnswer: 'ln(x)',
        explanation: 'La integral de 1/x es ln(x) + C',
      },
    ],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '2',
    userId: '2',
    subject: 'Lengua',
    difficulty: 'easy',
    questions: [
      {
        id: 1,
        question: '¿Qué es un sustantivo?',
        options: [
          'Palabra que nombra',
          'Palabra que describe',
          'Palabra que une',
          'Palabra que modifica',
        ],
        correctAnswer: 'Palabra que nombra',
        explanation: 'Los sustantivos son palabras que nombran personas, lugares o cosas',
      },
    ],
    createdAt: new Date('2024-02-05'),
  },
];