import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { ScanHistory } from '../entities/scan-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScanHistory])],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
