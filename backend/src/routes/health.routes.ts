import { Router, Request, Response } from "express";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({
        success: true, 
        message: 'Servidor de Selectividad API funcionando correctamente',
        data:{
            status: 'OK',
            timeStamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        }
    })
});

export default router;
