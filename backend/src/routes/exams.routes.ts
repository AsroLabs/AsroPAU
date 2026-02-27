import { Router, Request, Response } from 'express';
import { examsData } from '../data/exams.data';
import { ApiResponse, CreateExamDto, Exam } from '../types';
import { ExceptionHandler } from 'winston';

const router = Router();

router.get('/', (req: Request, res: Response)=>{
    const {subject, difficulty, userId} = req.query;

    let filtered = examsData

    if (subject){
        filtered = filtered.filter(
            (e)=> e.subject.toLowerCase().includes((subject as string).toLowerCase())
        )



    }


;})

export default router;