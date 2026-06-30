// src/modules/partners/dto/partner-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PartnerContactResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() contactUid: string;
  @ApiProperty() fullName: string;
  @ApiProperty({ nullable: true }) positionTitle?: string;
  @ApiProperty({ nullable: true }) department?: string;
  @ApiProperty() email: string;
  @ApiProperty({ nullable: true }) mobilePhone?: string;
  @ApiProperty({ nullable: true }) officePhone?: string;
  @ApiProperty() isPrimary: boolean;
  @ApiProperty({ nullable: true }) roleInPartnership?: string;
  @ApiProperty() createdAt: Date;
}

export class InternalFocalPersonResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() isPrimary: boolean;
  @ApiProperty({ nullable: true }) position?: string;
  @ApiProperty({ nullable: true }) division?: string;
  @ApiProperty({ nullable: true }) directorate?: string;
  @ApiProperty({ nullable: true }) email?: string;
  @ApiProperty({ nullable: true }) phone?: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() user: {
    id: string;
    fullName: string;
    email: string;
    position?: string;
  };
}

export class PartnerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() partnerUid: string;
  @ApiProperty() partnerId: string;
  @ApiProperty() registrationPath: string;

  @ApiProperty({ nullable: true }) agreementId?: string;
  @ApiProperty({ nullable: true }) opportunityId?: string;
  @ApiProperty({ nullable: true }) engagementId?: string;

  @ApiProperty() partnerName: string;
  @ApiProperty({ nullable: true }) acronym?: string;
  @ApiProperty({ nullable: true }) organizationType?: { id: string; typeName: string };
  @ApiProperty() country: string;
  @ApiProperty({ nullable: true }) regionState?: string;
  @ApiProperty({ nullable: true }) city?: string;
  @ApiProperty({ nullable: true }) address?: string;
  @ApiProperty({ nullable: true }) website?: string;
  @ApiProperty({ nullable: true }) yearEstablished?: number;
  @ApiProperty({ nullable: true }) registrationLicenseNumber?: string;
  @ApiProperty({ nullable: true }) taxNumber?: string;
  @ApiProperty({ nullable: true }) logoUrl?: string;

  @ApiProperty({ nullable: true }) mission?: string;
  @ApiProperty({ nullable: true }) vision?: string;
  @ApiProperty({ nullable: true }) strategicFocusAreas?: string;
  @ApiProperty({ nullable: true }) keyExpertiseAreas?: string;
  @ApiProperty({ nullable: true }) aiFocusAreas?: string;
  @ApiProperty({ nullable: true }) annualBudget?: string;
  @ApiProperty({ nullable: true }) numberOfEmployees?: number;
  @ApiProperty({ nullable: true }) geographicCoverage?: string;
  @ApiProperty({ nullable: true }) partnerClassification?: { id: string; classificationName: string };

  @ApiProperty() status: { id: string; statusName: string };
  @ApiProperty() verifiedStatus: string;

  @ApiProperty() createdBy: { id: string; fullName: string; email: string; position?: string };
  @ApiProperty({ nullable: true }) reviewer?: { id: string; fullName: string; email: string };
  @ApiProperty({ nullable: true }) reviewNotes?: string;
  @ApiProperty({ nullable: true }) reviewDate?: Date;
  @ApiProperty({ nullable: true }) verifier?: { id: string; fullName: string; email: string };
  @ApiProperty({ nullable: true }) verificationNotes?: string;
  @ApiProperty({ nullable: true }) verificationDate?: Date;

  @ApiProperty({ nullable: true }) agreement?: { id: string; agreementId: string; agreementTitle: string };
  @ApiProperty({ nullable: true }) opportunity?: { id: string; title: string };
  @ApiProperty({ nullable: true }) engagement?: { id: string; recordId: string };

  @ApiProperty({ type: [PartnerContactResponseDto] }) contacts: PartnerContactResponseDto[];
  @ApiProperty({ type: [InternalFocalPersonResponseDto] }) focalPersons: InternalFocalPersonResponseDto[];

  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
