// src/modules/collaborations/dto/update-project-milestone.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProjectMilestoneDto } from './create-project-milestone.dto';

export class UpdateProjectMilestoneDto extends PartialType(CreateProjectMilestoneDto) {}
