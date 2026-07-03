// src/modules/collaborations/dto/update-grant-disbursement.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateGrantDisbursementDto } from './create-grant-disbursement.dto';

export class UpdateGrantDisbursementDto extends PartialType(CreateGrantDisbursementDto) {}
