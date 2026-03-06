import { Router } from 'express';
import healthRoutes from './health.routes';
import gradosRoutes from './grados.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/grados', gradosRoutes);

export default router;

