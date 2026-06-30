// src/modules/collaborations/dto/update-project-deliverable.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProjectDeliverableDto } from './create-project-deliverable.dto';

export class UpdateProjectDeliverableDto extends PartialType(CreateProjectDeliverableDto) {}
