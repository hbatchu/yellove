import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface AnalysisResult {
  name: string | null;
  brand: string | null;
  ingredients: string | null;
  nutrition: {
    calories: number | null;
    fat: number | null;
    saturated_fat: number | null;
    carbs: number | null;
    sugar: number | null;
    fiber: number | null;
    protein: number | null;
    sodium: number | null;
  };
  score: number;
  grade: string;
  insights: string[];
}

@Injectable()
export class AnalyzeService {
  async analyzeImages(filePaths: string[]): Promise<AnalysisResult> {
    if (!filePaths.length) throw new BadRequestException('No images provided');

    const imageContents = filePaths.map(fp => {
      const data = fs.readFileSync(fp).toString('base64');
      const ext = path.extname(fp).toLowerCase().slice(1);
      const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      return { type: 'image_url', image_url: { url: `data:${mimeType};base64,${data}` } };
    });

    const contextHint = filePaths.length > 1
      ? 'The first image is the front of a food/beverage product. The second image is the back label.'
      : 'This is a food/beverage product image.';

    const prompt = `${contextHint}

Extract all visible information and respond ONLY with valid JSON (no markdown, no explanation):
{
  "name": "full product name or null",
  "brand": "brand name or null",
  "ingredients": "full ingredients list or null",
  "nutrition": {
    "calories": number_or_null,
    "fat": number_or_null,
    "saturated_fat": number_or_null,
    "carbs": number_or_null,
    "sugar": number_or_null,
    "fiber": number_or_null,
    "protein": number_or_null,
    "sodium": number_or_null
  }
}

All nutrition values per 100g/ml. Use null for anything not visible. Do NOT wrap in markdown or code blocks. Output raw JSON only.`;

    let raw = '';
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                ...imageContents,
                { type: 'text', text: prompt },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`${res.status} ${err}`);
      }

      const data: any = await res.json();
      raw = data.choices?.[0]?.message?.content ?? '';
    } catch (err: any) {
      throw new InternalServerErrorException(
        `AI analysis failed: ${err?.message ?? 'unknown error'}`,
      );
    }

    let extracted: any = { nutrition: {} };
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) extracted = JSON.parse(match[0]);
    } catch {
      // Return minimal result on parse failure
    }

    const n = extracted.nutrition || {};
    const scoreResult = this.computeScore(n, extracted.ingredients || '');

    return {
      name: extracted.name ?? null,
      brand: extracted.brand ?? null,
      ingredients: extracted.ingredients ?? null,
      nutrition: {
        calories: n.calories ?? null,
        fat: n.fat ?? null,
        saturated_fat: n.saturated_fat ?? null,
        carbs: n.carbs ?? null,
        sugar: n.sugar ?? null,
        fiber: n.fiber ?? null,
        protein: n.protein ?? null,
        sodium: n.sodium ?? null,
      },
      ...scoreResult,
    };
  }

  private computeScore(
    n: Record<string, number>,
    ingredients: string,
  ): { score: number; grade: string; insights: string[] } {
    let score = 100;
    const insights: string[] = [];

    const sugar = n.sugar ?? 0;
    const saturatedFat = n.saturated_fat ?? 0;
    const sodium = n.sodium ?? 0;
    const fiber = n.fiber ?? 0;
    const protein = n.protein ?? 0;

    if (sugar > 10) {
      score -= Math.min(30, (sugar - 10) * 2);
      insights.push(`High in sugar (${sugar.toFixed(1)}g per 100g)`);
    }
    if (saturatedFat > 5) {
      score -= Math.min(20, (saturatedFat - 5) * 3);
      insights.push(`High in saturated fat (${saturatedFat.toFixed(1)}g per 100g)`);
    }
    if (sodium > 0.5) {
      score -= Math.min(20, (sodium - 0.5) * 20);
      insights.push(`High in sodium (${sodium.toFixed(2)}g per 100g)`);
    }

    const lower = ingredients.toLowerCase();
    const harmful = [
      'palm oil', 'e102', 'e110', 'e124', 'e129', 'e211', 'e621',
      'high fructose corn syrup', 'hydrogenated', 'artificial flavour', 'artificial color',
    ];
    let hits = 0;
    for (const h of harmful) {
      if (lower.includes(h)) { score -= 5; hits++; }
    }
    if (hits > 0) insights.push(`Contains ${hits} potentially harmful additive(s)`);

    if (fiber >= 3) { score += 5; insights.push(`Good source of fiber (${fiber.toFixed(1)}g per 100g)`); }
    if (protein >= 5) { score += 5; insights.push(`Good source of protein (${protein.toFixed(1)}g per 100g)`); }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    const grade =
      finalScore >= 80 ? 'A' :
      finalScore >= 60 ? 'B' :
      finalScore >= 40 ? 'C' :
      finalScore >= 20 ? 'D' : 'E';

    return { score: finalScore, grade, insights };
  }
}
