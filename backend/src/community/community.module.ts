import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';
import { CommunityProduct } from '../entities/community-product.entity';
import { ScanHistory } from '../entities/scan-history.entity';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityProduct, ScanHistory]), ScoringModule],
  controllers: [CommunityController, AnalyzeController],
  providers: [CommunityService, AnalyzeService],
})
export class CommunityModule {}
