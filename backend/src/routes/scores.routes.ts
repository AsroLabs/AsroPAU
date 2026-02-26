import { Router, Request, Response } from 'express';
import { universitiesData } from '../data/universities.data';
import { ApiResponse, CalculateScoreDto } from '../types';

const router = Router();

// POST /scores/calculate - Calcular nota final
router.post('/calculate', (req: Request, res: Response) => {
  const { examGrade, bachelorGrade, specificSubjectsGrade }: CalculateScoreDto = req.body;

  
  if (
    examGrade === undefined ||
    bachelorGrade === undefined ||
    examGrade < 0 ||
    examGrade > 10 ||
    bachelorGrade < 0 ||
    bachelorGrade > 10
  ) {
    return res.status(400).json({
      success: false,
      message: 'Las notas deben estar entre 0 y 10',
    });
  }

  if (specificSubjectsGrade !== undefined && (specificSubjectsGrade < 0 || specificSubjectsGrade > 10)) {
    return res.status(400).json({
      success: false,
      message: 'La nota de específicas debe estar entre 0 y 10',
    });
  }

  
  let finalScore = 0.6 * bachelorGrade + 0.4 * examGrade;

  
  if (specificSubjectsGrade !== undefined) {
    const bonus = specificSubjectsGrade * 0.2;
    finalScore += bonus;
  }

  
  finalScore = Math.min(finalScore, 14);

    const accessibleDegrees = universitiesData
    .flatMap((u) =>
      u.degrees
        .filter((d) => d.cutoffGrade <= finalScore)
        .map((d) => ({
          degree: d.name,
          university: u.name,
          cutoffGrade: d.cutoffGrade,
          field: d.field,
          community: u.community,
          city: u.city,
          difference: finalScore - d.cutoffGrade, 
        }))
    )
    .sort((a, b) => b.cutoffGrade - a.cutoffGrade) 
    .slice(0, 10);

  const response: ApiResponse = {
    success: true,
    data: {
      finalScore: parseFloat(finalScore.toFixed(3)),
      breakdown: {
        bachelorContribution: parseFloat((0.6 * bachelorGrade).toFixed(3)),
        examContribution: parseFloat((0.4 * examGrade).toFixed(3)),
        specificSubjectsBonus: specificSubjectsGrade
          ? parseFloat((specificSubjectsGrade * 0.2).toFixed(3))
          : 0,
      },
      accessibleDegrees,
      totalAccessibleDegrees: accessibleDegrees.length,
    },
    message: 'Nota calculada correctamente',
  };

  res.json(response);
});

export default router;