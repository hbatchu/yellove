import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { ScoringModule } from './scoring/scoring.module';
import { HistoryModule } from './history/history.module';
import { CommunityModule } from './community/community.module';
import { User } from './entities/user.entity';
import { ScanHistory } from './entities/scan-history.entity';
import { ProductCache } from './entities/product-cache.entity';
import { CommunityProduct } from './entities/community-product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, ScanHistory, ProductCache, CommunityProduct],
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          }
        : {
            type: 'sqlite',
            database: 'nutrio.db',
            entities: [User, ScanHistory, ProductCache, CommunityProduct],
            synchronize: true,
          },
    ),
    AuthModule,
    ScoringModule,
    ProductModule,
    HistoryModule,
    CommunityModule,
  ],
})
export class AppModule {}
