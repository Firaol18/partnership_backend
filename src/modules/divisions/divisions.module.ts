import { Module } from '@nestjs/common';
import { DivisionsService } from './divisions.service';
import { DivisionsController } from './divisions.controller';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  providers: [DivisionsService, PrismaService],
  controllers: [DivisionsController],
  exports: [DivisionsService],
})
export class DivisionsModule {}
