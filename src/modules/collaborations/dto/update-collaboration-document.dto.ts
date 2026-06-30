// src/modules/collaborations/dto/update-collaboration-document.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateCollaborationDocumentDto } from './create-collaboration-document.dto';

export class UpdateCollaborationDocumentDto extends PartialType(CreateCollaborationDocumentDto) {}
