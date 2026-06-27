// src/modules/visits/dto/visit-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class VisitTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  typeName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class VisitCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  categoryName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class DelegateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  delegateUid: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  position?: string;

  @ApiProperty()
  organizationName: string;

  @ApiProperty({ nullable: true })
  country?: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  phoneNumber?: string;

  @ApiProperty()
  status: string;
}

export class VisitOutcomeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  outcomeUid: string;

  @ApiProperty({ nullable: true })
  keyTopicsDiscussed?: string;

  @ApiProperty({ nullable: true })
  opportunitiesIdentified?: string;

  @ApiProperty({ nullable: true })
  agreementsReached?: string;

  @ApiProperty({ nullable: true })
  followUpActions?: string;
}

export class VisitResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  visitUid: string;

  @ApiProperty()
  recordId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: VisitTypeResponseDto })
  visitType: VisitTypeResponseDto;

  @ApiProperty({ type: VisitCategoryResponseDto })
  visitCategory: VisitCategoryResponseDto;

  @ApiProperty()
  visitDate: string;

  @ApiProperty()
  hostOrganization: string;

  @ApiProperty()
  visitingOrganization: string;

  @ApiProperty({ nullable: true })
  visitLocation?: string;

  @ApiProperty({ nullable: true })
  purpose?: string;

  @ApiProperty()
  focalPerson: {
    id: string;
    fullName: string;
    email: string;
    position?: string;
  };

  @ApiProperty({ nullable: true })
  partnerId?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  verifiedStatus: string;

  @ApiProperty({ nullable: true })
  reviewNotes?: string;

  @ApiProperty({ nullable: true })
  verificationNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [DelegateResponseDto] })
  delegates?: DelegateResponseDto[];

  @ApiProperty({ type: VisitOutcomeResponseDto, nullable: true })
  outcome?: VisitOutcomeResponseDto;

  @ApiProperty()
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
}
