import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface RawProduct {
  name: string;
  brand: string;
  image: string;
  quantity: string;
  categories: string;
  nutriScore: string;
  nutriments: Record<string, number>;
  ingredientsText: string;
  source: string;
}

const HTTP_TIMEOUT = 8000;
const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';

@Injectable()
export class ProductSourcesService {
  private readonly logger = new Logger(ProductSourcesService.name);

  async lookup(barcode: string): Promise<RawProduct | null> {
    const sources = [
      () => this.fetchOFFWorld(barcode),
      () => this.fetchOFFIndia(barcode),
      () => this.fetchUpcItemDb(barcode),
      () => this.fetchBigBasket(barcode),
    ];

    for (const source of sources) {
      try {
        const result = await source();
        if (result) {
          this.logger.log(`Resolved ${barcode} via ${result.source}`);
          return result;
        }
      } catch (e: any) {
        this.logger.warn(`Source failed for ${barcode}: ${e.message}`);
      }
    }
    return null;
  }

  private async fetchOFFWorld(barcode: string): Promise<RawProduct | null> {
    const { data } = await axios.get(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { timeout: HTTP_TIMEOUT, headers: { 'User-Agent': 'NutrioApp/1.0' } },
    );
    if (data?.status !== 1 || !data.product) return null;
    return this.parseOFF(data.product, 'OpenFoodFacts-World');
  }

  private async fetchOFFIndia(barcode: string): Promise<RawProduct | null> {
    const { data } = await axios.get(
      `https://in.openfoodfacts.org/api/v2/product/${barcode}.json`,
      { timeout: HTTP_TIMEOUT, headers: { 'User-Agent': 'NutrioApp/1.0' } },
    );
    if (data?.status !== 1 || !data.product) return null;
    return this.parseOFF(data.product, 'OpenFoodFacts-India');
  }

  private parseOFF(p: any, source: string): RawProduct | null {
    const name =
      p.product_name_en || p.product_name_hi || p.product_name || '';
    if (!name.trim()) return null;
    return {
      name: name.trim(),
      brand: p.brands || '',
      image: p.image_front_url || p.image_url || '',
      quantity: p.quantity || '',
      categories: p.categories || '',
      nutriScore: (p.nutriscore_grade || '').toUpperCase(),
      nutriments: p.nutriments || {},
      ingredientsText:
        p.ingredients_text_en || p.ingredients_text || '',
      source,
    };
  }

  private async fetchUpcItemDb(barcode: string): Promise<RawProduct | null> {
    const { data } = await axios.get(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
      {
        timeout: HTTP_TIMEOUT,
        headers: { 'User-Agent': 'NutrioApp/1.0 product-health-scanner' },
      },
    );
    const item = data?.items?.[0];
    if (!item?.title) return null;

    return {
      name: item.title,
      brand: item.brand || '',
      image: item.images?.[0] || '',
      quantity: item.size || '',
      categories: item.category || '',
      nutriScore: '',
      nutriments: {},
      ingredientsText: item.description || '',
      source: 'UPCItemDB',
    };
  }

  private async fetchBigBasket(barcode: string): Promise<RawProduct | null> {
    const { data } = await axios.get(
      `https://www.bigbasket.com/ps/?q=${barcode}&nc=as`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': MOBILE_UA,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-IN,en;q=0.9',
        },
      },
    );

    const $ = cheerio.load(data);

    // BigBasket search result selectors (best-effort, may change)
    const name =
      $('[qa="product_name"]').first().text().trim() ||
      $('.prod-name').first().text().trim() ||
      $('h3.truncate').first().text().trim();

    if (!name) return null;

    const brand =
      $('[qa="brand_name"]').first().text().trim() ||
      $('.brand-name').first().text().trim() ||
      '';

    const image =
      $('[qa="product_image"] img').first().attr('src') ||
      $('.prod-img img').first().attr('src') ||
      '';

    return {
      name,
      brand,
      image,
      quantity: '',
      categories: 'Indian Grocery',
      nutriScore: '',
      nutriments: {},
      ingredientsText: '',
      source: 'BigBasket',
    };
  }
}
