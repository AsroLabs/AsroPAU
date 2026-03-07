import { Router } from 'express';
import healthRoutes from './health.routes';
import universitiesRoutes from './universities.routes';
import examsRoutes from './exams.routes';
import usersRoutes from './users.routes';
import gradosRoutes from './grados.routes';

const router = Router();

// Registrar todas las rutas
router.use('/health', healthRoutes);
router.use('/universities', universitiesRoutes);
router.use('/exams', examsRoutes);
router.use('/users', usersRoutes);
router.use('/grados', gradosRoutes);

export default router;