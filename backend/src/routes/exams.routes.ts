import { Router, Request, Response } from 'express';
import { examsData } from '../data/exams.data';
import { ApiResponse, CreateExamDto, Exam } from '../types';
import { ExceptionHandler } from 'winston';

const router = Router();

router.get('/', (req: Request, res: Response) => {

    // return res.json({
    //     success: true,
    //     message: "Exámenes obtenidos correctamente"
    // }).status(200);

    const { subject, difficulty, userId } = req.query;
    let filtered = examsData;

    if (subject) {
        filtered = filtered.filter(
            (e) => e.subject.toLowerCase().includes((subject as string).toLowerCase())
        )
}
});


router.get('/pau', (req: Request, res: Response) => {
    const { subject, convocation, year, location } = req.query;

    res.json({
        success: true,
        data: {
            subject,
            convocation,
            year: parseInt(year as string),
            location
        }
    }).status(200);
});

export default router;