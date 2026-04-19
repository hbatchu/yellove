import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityProduct } from '../entities/community-product.entity';
import { ScanHistory } from '../entities/scan-history.entity';
import { ScoringService } from '../scoring/scoring.service';

interface SubmitDto {
  barcode: string;
  name: string;
  brand?: string;
  ingredients?: string;
  nutrition?: Record<string, number>;
}

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);

  constructor(
    @InjectRepository(CommunityProduct) private repo: Repository<CommunityProduct>,
    @InjectRepository(ScanHistory) private historyRepo: Repository<ScanHistory>,
    private scoringService: ScoringService,
  ) {}

  async submit(userId: string, dto: SubmitDto, imagePath?: string): Promise<CommunityProduct> {
    const existing = await this.repo.findOne({ where: { barcode: dto.barcode } });

    let product: CommunityProduct;
    if (existing) {
      existing.name = dto.name;
      if (dto.brand) existing.brand = dto.brand;
      if (imagePath) existing.imagePath = imagePath;
      if (dto.nutrition) existing.nutritionJson = JSON.stringify(dto.nutrition);
      if (dto.ingredients) existing.ingredients = dto.ingredients;
      product = await this.repo.save(existing);
    } else {
      product = await this.repo.save(
        this.repo.create({
          barcode: dto.barcode,
          userId,
          name: dto.name,
          brand: dto.brand || '',
          imagePath: imagePath || '',
          nutritionJson: dto.nutrition ? JSON.stringify(dto.nutrition) : '',
          ingredients: dto.ingredients || '',
          verified: false,
        }),
      );
    }

    await this.saveHistory(userId, product);
    return product;
  }

  getByBarcode(barcode: string) {
    return this.repo.findOne({ where: { barcode } });
  }

  private async saveHistory(userId: string, cp: CommunityProduct) {
    try {
      const n = cp.nutritionJson ? JSON.parse(cp.nutritionJson) : {};
      const nutriments = {
        'energy-kcal_100g': n.calories ?? 0,
        'fat_100g': n.fat ?? 0,
        'saturated-fat_100g': n.saturatedFat ?? n.saturated_fat ?? 0,
        'carbohydrates_100g': n.carbs ?? 0,
        'sugars_100g': n.sugar ?? 0,
        'fiber_100g': n.fiber ?? 0,
        'proteins_100g': n.protein ?? 0,
        'sodium_100g': n.sodium ?? 0,
      };
      const { score, grade } = this.scoringService.compute(nutriments, cp.ingredients || '');

      await this.historyRepo.save({
        userId,
        barcode: cp.barcode,
        productName: cp.name,
        productBrand: cp.brand || '',
        productImage: '',
        healthScore: score,
        grade,
        source: 'Community',
      });
    } catch (e: any) {
      this.logger.warn(`History save failed: ${e.message}`);
    }
  }
}
