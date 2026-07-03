// src/modules/agreements/dto/agreement-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AgreementTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  typeName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class SignatoryResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  organization: string;
}

export class AgreementAmendmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amendmentUid: string;

  @ApiProperty()
  amendmentTitle: string;

  @ApiProperty({ nullable: true })
  amendmentDescription?: string;

  @ApiProperty()
  amendmentDate: Date;

  @ApiProperty()
  effectiveDate: Date;

  @ApiProperty({ nullable: true })
  changedClauses?: any;

  @ApiProperty({ nullable: true })
  reasonForAmendment?: string;

  @ApiProperty({ nullable: true })
  documentId?: string;

  @ApiProperty({ nullable: true })
  approvalStatus: string;

  @ApiProperty({ nullable: true })
  approvedDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ nullable: true })
  approvedBy?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty()
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
}

export class AgreementDocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentId: string;

  @ApiProperty()
  documentCategory: string;

  @ApiProperty()
  isCurrentVersion: boolean;

  @ApiProperty({ nullable: true })
  versionNumber?: string;

  @ApiProperty()
  createdAt: Date;
}

export class AgreementReviewHistoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reviewType: string;

  @ApiProperty({ nullable: true })
  reviewNotes?: string;

  @ApiProperty()
  reviewStatus: string;

  @ApiProperty()
  reviewDate: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  reviewer: {
    id: string;
    fullName: string;
    email: string;
  };
}

export class AgreementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  agreementUid: string;

  @ApiProperty()
  agreementId: string;

  @ApiProperty()
  opportunityId: string;

  @ApiProperty({ nullable: true })
  engagementId?: string;

  @ApiProperty({ nullable: true })
  partnerId?: string;

  @ApiProperty()
  agreementTitle: string;

  @ApiProperty({ type: () => AgreementTypeResponseDto })
  agreementType: AgreementTypeResponseDto;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiProperty({ nullable: true })
  renewalDate?: string;

  @ApiProperty()
  legalReviewStatus: string;

  @ApiProperty({ nullable: true })
  legalReviewNotes?: string;

  @ApiProperty({ nullable: true })
  legalReviewDate?: Date;

  @ApiProperty()
  legalApproved: boolean;

  @ApiProperty()
  approvalStatus: string;

  @ApiProperty({ nullable: true })
  approvalNotes?: string;

  @ApiProperty({ nullable: true })
  approvalDate?: Date;

  @ApiProperty({ nullable: true })
  reviewNotes?: string;

  @ApiProperty({ nullable: true })
  reviewDate?: Date;

  @ApiProperty({ nullable: true })
  verificationNotes?: string;

  @ApiProperty({ nullable: true })
  verificationDate?: Date;

  @ApiProperty()
  verifiedStatus: string;

  @ApiProperty()
  partnerName: string;

  @ApiProperty()
  eaiiResponsibleDivision: string;

  @ApiProperty({ nullable: true })
  eaiiResponsibleDirectorate?: string;

  @ApiProperty({ type: [SignatoryResponseDto] })
  signatories: SignatoryResponseDto[];

  @ApiProperty({ nullable: true })
  signingDate?: string;

  @ApiProperty({ nullable: true })
  signedVersionPath?: string;

  @ApiProperty()
  version: number;

  @ApiProperty({ nullable: true })
  previousVersionId?: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true })
  terminationNote?: string;

  @ApiProperty()
  createdBy: {
    id: string;
    fullName: string;
    email: string;
    position?: string;
  };

  @ApiProperty({ nullable: true })
  legalReviewedBy?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({ nullable: true })
  reviewer?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({ nullable: true })
  verifier?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({ nullable: true })
  approver?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({ type: [AgreementDocumentResponseDto] })
  documents?: AgreementDocumentResponseDto[];

  @ApiProperty({ type: [AgreementAmendmentResponseDto] })
  amendments?: AgreementAmendmentResponseDto[];

  @ApiProperty({ type: [AgreementReviewHistoryResponseDto] })
  reviewHistory?: AgreementReviewHistoryResponseDto[];

  @ApiProperty({ nullable: true })
  opportunity?: {
    id: string;
    title: string;
    partnerName: string;
  };

  @ApiProperty({ nullable: true })
  engagement?: {
    id: string;
    recordId: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
