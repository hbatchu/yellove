import { Injectable } from '@nestjs/common';

const RULES = {
  sugar_limit: 10,           // g per 100g
  saturated_fat_limit: 5,    // g per 100g
  sodium_limit: 0.5,         // g per 100g
  fiber_bonus_threshold: 3,  // g per 100g
  protein_bonus_threshold: 5,
  harmful_additives: [
    'palm oil',
    'e102', 'e110', 'e124', 'e129', 'e211', 'e621',
    'high fructose corn syrup',
    'hydrogenated',
    'artificial flavour',
    'artificial color',
  ],
};

export interface ScoreResult {
  score: number;
  grade: string;
  insights: string[];
}

@Injectable()
export class ScoringService {
  compute(
    nutriments: Record<string, number>,
    ingredientsText: string,
  ): ScoreResult {
    let score = 100;
    const insights: string[] = [];

    const sugar = nutriments?.['sugars_100g'] ?? 0;
    const saturatedFat = nutriments?.['saturated-fat_100g'] ?? 0;
    const sodium = nutriments?.['sodium_100g'] ?? 0;
    const fiber = nutriments?.['fiber_100g'] ?? 0;
    const protein = nutriments?.['proteins_100g'] ?? 0;

    if (sugar > RULES.sugar_limit) {
      score -= Math.min(30, (sugar - RULES.sugar_limit) * 2);
      insights.push(`High in sugar (${sugar.toFixed(1)}g per 100g)`);
    }

    if (saturatedFat > RULES.saturated_fat_limit) {
      score -= Math.min(20, (saturatedFat - RULES.saturated_fat_limit) * 3);
      insights.push(
        `High in saturated fat (${saturatedFat.toFixed(1)}g per 100g)`,
      );
    }

    if (sodium > RULES.sodium_limit) {
      score -= Math.min(20, (sodium - RULES.sodium_limit) * 20);
      insights.push(`High in sodium (${sodium.toFixed(2)}g per 100g)`);
    }

    const lower = (ingredientsText ?? '').toLowerCase();
    let additiveHits = 0;
    for (const additive of RULES.harmful_additives) {
      if (lower.includes(additive)) {
        score -= 5;
        additiveHits++;
      }
    }
    if (additiveHits > 0) {
      insights.push(
        `Contains ${additiveHits} potentially harmful additive(s)`,
      );
    }

    if (fiber >= RULES.fiber_bonus_threshold) {
      score += 5;
      insights.push(`Good source of fiber (${fiber.toFixed(1)}g per 100g)`);
    }

    if (protein >= RULES.protein_bonus_threshold) {
      score += 5;
      insights.push(
        `Good source of protein (${protein.toFixed(1)}g per 100g)`,
      );
    }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    return { score: finalScore, grade: this.grade(finalScore), insights };
  }

  private grade(score: number): string {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    if (score >= 20) return 'D';
    return 'E';
  }
}
