import { Router, Request, Response } from 'express';
import { universitiesData } from '../data/universities.data';
import { ApiResponse } from '../types'

const router = Router();

router.get('/', (req: Request, res: Response) =>{
    const { community, city, degree, minGrade, maxGrade } = req.query;

    let filtered = universitiesData;

    if (community) {
        filtered = filtered.filter(
            (u)=> u.community.toLowerCase() === (community as string).toLowerCase()
        )
    }

    if (city){
        filtered = filtered.filter(
            (u)=> u.city.toLowerCase() === (city as string).toLowerCase()
        )

    }

    if (degree){
        filtered = filtered.filter(
            (u) => u.degrees.some(
                (d) => d.name.toLowerCase() === (degree as string).toLowerCase()
            )
        )
    }

    if (minGrade){
        const min = parseFloat(minGrade as string);
        filtered = filtered.filter(
            (u) => u.degrees.some(
                (d) => d.cutoffGrade >= min
            )
        )
    }

    if (maxGrade){
        const max = parseFloat(maxGrade as string);
        filtered = filtered.filter(
            (u)=> u.degrees.some(
                (d) => d.cutoffGrade <= max
            )
        )
    

        const response: ApiResponse = {
            success: true,
            data: filtered,
            message: 'Universidades filtradas correctamente',
        };

        res.json(response);
    };

});

