import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoringService } from '../scoring/scoring.service';
import { ProductSourcesService, RawProduct } from './product-sources.service';
import { ProductCache } from '../entities/product-cache.entity';
import { CommunityProduct } from '../entities/community-product.entity';
import { ScanHistory } from '../entities/scan-history.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly scoringService: ScoringService,
    private readonly sourcesService: ProductSourcesService,
    @InjectRepository(ProductCache) private cacheRepo: Repository<ProductCache>,
    @InjectRepository(CommunityProduct) private communityRepo: Repository<CommunityProduct>,
    @InjectRepository(ScanHistory) private historyRepo: Repository<ScanHistory>,
  ) {}

  async getByBarcode(barcode: string, userId?: string): Promise<any> {
    // 1. Verified community data (highest trust)
    const verified = await this.communityRepo.findOne({ where: { barcode, verified: true } });
    if (verified) {
      const product = this.fromCommunity(verified);
      await this.saveHistory(userId, barcode, product, 'Community-Verified');
      return product;
    }

    // 2. Warm cache (7-day TTL)
    const cached = await this.cacheRepo.findOne({ where: { barcode } });
    if (cached && new Date() < new Date(cached.expiresAt)) {
      const product = JSON.parse(cached.data);
      await this.saveHistory(userId, barcode, product, cached.source);
      return product;
    }

    // 3. Multi-source cascade (OFF World → OFF India → UPC Item DB → BigBasket)
    const raw = await this.sourcesService.lookup(barcode);

    if (!raw) {
      // 4. Unverified community as last resort
      const unverified = await this.communityRepo.findOne({ where: { barcode } });
      if (unverified) {
        const product = this.fromCommunity(unverified);
        await this.saveHistory(userId, barcode, product, 'Community');
        return product;
      }

      throw new NotFoundException(
        'Product not found. Help the community by adding this product!',
      );
    }

    const product = this.fromRaw(barcode, raw);

    // Cache for 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.cacheRepo.save({ barcode, data: JSON.stringify(product), source: raw.source, expiresAt });

    await this.saveHistory(userId, barcode, product, raw.source);
    return product;
  }

  private fromRaw(barcode: string, raw: RawProduct): any {
    const { score, grade, insights } = this.scoringService.compute(
      raw.nutriments,
      raw.ingredientsText,
    );
    return {
      barcode,
      name: raw.name,
      brand: raw.brand,
      image: raw.image || null,
      quantity: raw.quantity,
      categories: raw.categories,
      nutriScore: raw.nutriScore,
      healthScore: score,
      grade,
      insights,
      source: raw.source,
      nutrition: this.extractNutrition(raw.nutriments),
      ingredients: raw.ingredientsText,
    };
  }

  private fromCommunity(cp: CommunityProduct): any {
    const n = cp.nutritionJson ? JSON.parse(cp.nutritionJson) : {};
    const nutriments = {
      'energy-kcal_100g': n.calories ?? 0,
      'fat_100g': n.fat ?? 0,
      'saturated-fat_100g': n.saturatedFat ?? 0,
      'carbohydrates_100g': n.carbs ?? 0,
      'sugars_100g': n.sugar ?? 0,
      'fiber_100g': n.fiber ?? 0,
      'proteins_100g': n.protein ?? 0,
      'sodium_100g': n.sodium ?? 0,
    };
    const { score, grade, insights } = this.scoringService.compute(nutriments, cp.ingredients || '');
    const baseUrl = process.env.BASE_URL || 'http://192.168.1.8:3000';
    return {
      barcode: cp.barcode,
      name: cp.name,
      brand: cp.brand || '',
      image: cp.imagePath ? `${baseUrl}/uploads/${cp.imagePath}` : null,
      quantity: '',
      categories: cp.verified ? 'Community-Verified' : 'Community',
      nutriScore: '',
      healthScore: score,
      grade,
      insights,
      source: cp.verified ? 'Community-Verified' : 'Community',
      nutrition: this.extractNutrition(nutriments),
      ingredients: cp.ingredients || '',
    };
  }

  private extractNutrition(n: Record<string, number>) {
    return {
      calories: Math.round(n['energy-kcal_100g'] ?? n['energy_100g'] ?? 0),
      fat: +(n['fat_100g'] ?? 0).toFixed(2),
      saturatedFat: +(n['saturated-fat_100g'] ?? 0).toFixed(2),
      carbs: +(n['carbohydrates_100g'] ?? 0).toFixed(2),
      sugar: +(n['sugars_100g'] ?? 0).toFixed(2),
      fiber: +(n['fiber_100g'] ?? n['fibers_100g'] ?? 0).toFixed(2),
      protein: +(n['proteins_100g'] ?? n['protein_100g'] ?? 0).toFixed(2),
      sodium: +(n['sodium_100g'] ?? 0).toFixed(3),
    };
  }

  private async saveHistory(userId: string | undefined, barcode: string, product: any, source: string) {
    if (!userId) return;
    try {
      const oneHourAgo = new Date(Date.now() - 3_600_000);
      const recent = await this.historyRepo.findOne({
        where: { userId, barcode },
        order: { scannedAt: 'DESC' },
      });
      if (recent && recent.scannedAt > oneHourAgo) return;

      await this.historyRepo.save({
        userId,
        barcode,
        productName: product.name,
        productBrand: product.brand || '',
        productImage: product.image || '',
        healthScore: product.healthScore,
        grade: product.grade,
        source,
      });
    } catch (e: any) {
      this.logger.warn(`History save failed: ${e.message}`);
    }
  }
}
