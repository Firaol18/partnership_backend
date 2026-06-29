// src/modules/agreements/dto/update-agreement.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateAgreementDto } from './create-agreement.dto';

export class UpdateAgreementDto extends PartialType(CreateAgreementDto) {}
