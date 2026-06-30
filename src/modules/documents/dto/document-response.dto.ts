// src/modules/documents/dto/document-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class DocumentTypeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;
}

export class DocumentUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;
}

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentUid: string;

  @ApiProperty()
  documentName: string;

  @ApiProperty()
  documentTypeId: string;

  @ApiProperty({ type: () => DocumentTypeDto })
  documentType: DocumentTypeDto;

  @ApiProperty({ nullable: true })
  description?: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  filePath: string;

  @ApiProperty({ nullable: true, type: String })
  fileSize?: string;

  @ApiProperty({ nullable: true })
  fileFormat?: string;

  @ApiProperty({ nullable: true })
  mimeType?: string;

  @ApiProperty({ nullable: true })
  version?: string;

  @ApiProperty()
  isLatestVersion: boolean;

  @ApiProperty({ nullable: true })
  previousVersionId?: string;

  @ApiProperty({ nullable: true })
  entityType?: string;

  @ApiProperty({ nullable: true })
  entityId?: string;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  accessLevel: string;

  @ApiProperty({ nullable: true })
  accessExpiryDate?: Date;

  @ApiProperty()
  downloadedCount: number;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: () => DocumentUserDto })
  uploadedBy: DocumentUserDto;

  @ApiProperty({ type: () => DocumentUserDto, nullable: true })
  updatedBy?: DocumentUserDto;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
