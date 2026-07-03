// src/modules/collaborations/dto/update-project-risk.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProjectRiskDto } from './create-project-risk.dto';

export class UpdateProjectRiskDto extends PartialType(CreateProjectRiskDto) {}
