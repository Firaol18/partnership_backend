// src/modules/opportunities/dto/opportunity-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class OpportunityCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class StrategicImportanceLevelResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  levelName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class OpportunitySourceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sourceName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class OpportunityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  opportunityUid: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  dateIdentified: string;

  @ApiProperty()
  partnerName: string;

  @ApiProperty({ nullable: true })
  partnerAcronym?: string;

  @ApiProperty({ nullable: true })
  organizationType?: string;

  @ApiProperty({ nullable: true })
  country?: string;

  @ApiProperty({ nullable: true })
  region?: string;

  @ApiProperty({ nullable: true })
  city?: string;

  @ApiProperty({ nullable: true })
  website?: string;

  @ApiProperty({ nullable: true })
  contactPersonName?: string;

  @ApiProperty({ nullable: true })
  contactPosition?: string;

  @ApiProperty({ nullable: true })
  contactEmail?: string;

  @ApiProperty({ nullable: true })
  contactPhone?: string;

  @ApiProperty({ nullable: true })
  existingRelationship?: string;

  @ApiProperty({ nullable: true })
  interestArea?: string;

  @ApiProperty({ type: StrategicImportanceLevelResponseDto, nullable: true })
  strategicImportanceLevel?: StrategicImportanceLevelResponseDto;

  @ApiProperty({ type: OpportunityCategoryResponseDto, nullable: true })
  opportunityCategory?: OpportunityCategoryResponseDto;

  @ApiProperty({ type: OpportunitySourceResponseDto, nullable: true })
  opportunitySource?: OpportunitySourceResponseDto;

  @ApiProperty({ nullable: true })
  opportunityBackground?: string;

  @ApiProperty({ nullable: true })
  opportunityDescription?: string;

  @ApiProperty({ nullable: true })
  proposedCollaborationArea?: string;

  @ApiProperty({ nullable: true })
  expectedOutcome?: string;

  @ApiProperty({ nullable: true })
  strategicAlignment?: string;

  @ApiProperty({ nullable: true })
  expectedBenefits?: string;

  @ApiProperty({ nullable: true })
  partnerId?: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true })
  verificationNotes?: string;

  @ApiProperty({ nullable: true })
  reviewNotes?: string;

  @ApiProperty({ nullable: true })
  approvalNotes?: string;

  @ApiProperty({ nullable: true })
  screenedAt?: Date;

  @ApiProperty({ nullable: true })
  verifiedAt?: Date;

  @ApiProperty({ nullable: true })
  reviewedAt?: Date;

  @ApiProperty({ nullable: true })
  approvedAt?: Date;

  @ApiProperty({ nullable: true })
  convertedToEntityType?: string;

  @ApiProperty({ nullable: true })
  convertedToEntityId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdBy: {
    id: string;
    fullName: string;
    email: string;
    position?: string;
  };

  @ApiProperty({ nullable: true })
  reviewedBy?: {
    id: string;
    fullName: string;
    email: string;
    position?: string;
  };

  @ApiProperty({ nullable: true })
  verifiedBy?: {
    id: string;
    fullName: string;
    email: string;
    position?: string;
  };
}
