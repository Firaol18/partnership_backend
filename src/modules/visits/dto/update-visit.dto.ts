// src/modules/visits/dto/update-visit.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateVisitDto } from './create-visit.dto';

export class UpdateVisitDto extends PartialType(CreateVisitDto) {}
