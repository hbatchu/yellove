import {
  Controller, Post, Get, Param, Body,
  Request, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const storage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`);
  },
});

@Controller('community/products')
export class CommunityController {
  constructor(private communityService: CommunityService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  submit(
    @Request() req: any,
    @Body() body: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.communityService.submit(
      req.user.id,
      {
        barcode: body.barcode,
        name: body.name,
        brand: body.brand,
        ingredients: body.ingredients,
        nutrition: body.nutrition ? JSON.parse(body.nutrition) : undefined,
      },
      file?.filename,
    );
  }

  @Get(':barcode')
  getByBarcode(@Param('barcode') barcode: string) {
    return this.communityService.getByBarcode(barcode);
  }
}
