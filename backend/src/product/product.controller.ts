import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(OptionalJwtGuard)
  @Get(':barcode')
  getByBarcode(@Param('barcode') barcode: string, @Request() req: any) {
    return this.productService.getByBarcode(barcode, req.user?.id);
  }
}
