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



router.get('/:id', (req: Request, res: Response)=>{
    const {id} = req.params;

    const univerity = universitiesData.find((u) => u.id === id);

    if(!univerity){
        return res.status(404).json({
            success: false,
            message: 'Universidad no encontrada',

        });


    }

    const response: ApiResponse = {
        success: true,
        data: univerity,
        message: 'Universidad encontrada correctamente',
    };
    res.json(response);
});


router.get('/:id/degrees', (req: Request, res: Response)=>{
    const {id} =req.params;

    const university = universitiesData.find((u) => u.id === id);

    if (!university){
        return res.status(404).json({
            success: false,
            message: 'Universidad no encontrada',
        });
    }

    const response: ApiResponse = {
        success: true,
        data: university.degrees,
        message: `${university.degrees.length} carreras disponibles`,
    };
    res.json(response);
});

// GET /universities/search/degrees - Buscar carreras en todas las universidades
router.get('/search/degrees', (req: Request, res: Response) => {
  const { name, field, maxGrade } = req.query;

  let allDegrees = universitiesData.flatMap((u) =>
    u.degrees.map((d) => ({
      ...d,
      universityName: u.name,
      community: u.community,
      city: u.city,
    }))
  );

  // Filtrar por nombre
  if (name) {
    allDegrees = allDegrees.filter((d) =>
      d.name.toLowerCase().includes((name as string).toLowerCase())
    );
  }

  // Filtrar por campo
  if (field) {
    allDegrees = allDegrees.filter(
      (d) => d.field.toLowerCase() === (field as string).toLowerCase()
    );
  }

  // Filtrar por nota máxima
  if (maxGrade) {
    const max = parseFloat(maxGrade as string);
    allDegrees = allDegrees.filter((d) => d.cutoffGrade <= max);
  }

  const response: ApiResponse = {
    success: true,
    data: allDegrees,
    message: `${allDegrees.length} carreras encontradas`,
  };

  res.json(response);
});

export default router;