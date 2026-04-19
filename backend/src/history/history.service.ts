import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanHistory } from '../entities/scan-history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(ScanHistory) private repo: Repository<ScanHistory>,
  ) {}

  async getUserHistory(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.repo.findAndCount({
      where: { userId },
      order: { scannedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  async clearHistory(userId: string) {
    await this.repo.delete({ userId });
    return { success: true };
  }
}
