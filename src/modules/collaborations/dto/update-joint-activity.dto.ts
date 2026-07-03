// src/modules/collaborations/dto/update-joint-activity.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateJointActivityDto } from './create-joint-activity.dto';

export class UpdateJointActivityDto extends PartialType(CreateJointActivityDto) {}
