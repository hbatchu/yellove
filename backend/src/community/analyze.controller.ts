import {
  Controller, Post, UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { AnalyzeService } from './analyze.service';

const storage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_, file, cb) => {
    cb(null, `analyze-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`);
  },
});

@Controller('community/analyze')
export class AnalyzeController {
  constructor(private analyzeService: AnalyzeService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 2, { storage }))
  async analyze(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image is required');
    }

    const filePaths = files.map(f => join(process.cwd(), 'uploads', f.filename));
    try {
      return await this.analyzeService.analyzeImages(filePaths);
    } finally {
      for (const fp of filePaths) {
        try { fs.unlinkSync(fp); } catch {}
      }
    }
  }
}
