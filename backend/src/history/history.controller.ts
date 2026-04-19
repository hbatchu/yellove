import { Controller, Get, Delete, Query, Request, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  getHistory(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.historyService.getUserHistory(req.user.id, +page, +limit);
  }

  @Delete()
  clearHistory(@Request() req: any) {
    return this.historyService.clearHistory(req.user.id);
  }
}
