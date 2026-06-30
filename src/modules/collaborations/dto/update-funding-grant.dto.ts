// src/modules/collaborations/dto/update-funding-grant.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateFundingGrantDto } from './create-funding-grant.dto';

export class UpdateFundingGrantDto extends PartialType(CreateFundingGrantDto) {}
