// src/modules/collaborations/dto/update-activity-output.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateActivityOutputDto } from './create-activity-output.dto';

export class UpdateActivityOutputDto extends PartialType(CreateActivityOutputDto) {}
