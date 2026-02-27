import { Router } from 'express';
import healthRoutes from './health.routes';
import universitiesRoutes from './universities.routes';
import scoresRoutes from './scores.routes';
import examsRoutes from './exams.routes';
import usersRoutes from './users.routes';

const router = Router();

// Registrar todas las rutas
router.use('/health', healthRoutes);
router.use('/universities', universitiesRoutes);
router.use('/scores', scoresRoutes);
router.use('/exams', examsRoutes);
router.use('/users', usersRoutes);

export default router;