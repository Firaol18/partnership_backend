// src/modules/collaborations/dto/update-resource-contribution.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateResourceContributionDto } from './create-resource-contribution.dto';

export class UpdateResourceContributionDto extends PartialType(CreateResourceContributionDto) {}
