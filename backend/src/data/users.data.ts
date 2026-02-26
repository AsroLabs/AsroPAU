import { User } from '../types';

// Datos temporales de usuarios (sin contraseñas hasheadas por ahora)
export const usersData: User[] = [
  {
    id: '1',
    email: 'estudiante1@mail.com',
    password: '123456', 
    name: 'Juan Pérez',
    role: 'STUDENT',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    email: 'estudiante2@mail.com',
    password: '123456',
    name: 'Ana García',
    role: 'STUDENT',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    email: 'admin@mail.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'ADMIN',
    createdAt: new Date('2024-01-01'),
  },
];