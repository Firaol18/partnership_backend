// src/modules/engagements/engagements.module.ts
import { Module } from '@nestjs/common';
import { EngagementsController } from './engagements.controller';
import { EngagementsService } from './engagements.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [EngagementsController],
  providers: [EngagementsService, PrismaService],
  exports: [EngagementsService],
})
export class EngagementsModule {}
