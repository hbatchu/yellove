import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSourcesService } from './product-sources.service';
import { ScoringModule } from '../scoring/scoring.module';
import { ProductCache } from '../entities/product-cache.entity';
import { CommunityProduct } from '../entities/community-product.entity';
import { ScanHistory } from '../entities/scan-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCache, CommunityProduct, ScanHistory]),
    ScoringModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductSourcesService],
})
export class ProductModule {}
