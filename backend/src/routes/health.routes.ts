import { Router, Request, Response } from "express";
import { time, timeStamp } from "node:console";
import { env, uptime } from "node:process";
import { startTimer } from "winston";

const router = Router();

router.get('/health', (req: Request, res: Response) => {
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
