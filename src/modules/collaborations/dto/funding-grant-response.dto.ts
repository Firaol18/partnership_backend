// src/modules/collaborations/dto/funding-grant-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GrantPartnerDto {
  @ApiProperty() id: string;
  @ApiProperty() partnerName: string;
  @ApiProperty() partnerId: string;
}

export class GrantProjectDto {
  @ApiProperty() id: string;
  @ApiProperty() projectName: string;
  @ApiProperty() projectId: string;
}

export class GrantResourceContributionDto {
  @ApiProperty() id: string;
  @ApiProperty() resourceId: string;
}

export class GrantUserDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() email: string;
}

export class GrantDisbursementResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() disbursementUid: string;
  @ApiProperty() grantId: string;
  @ApiProperty() disbursementDate: Date;
  @ApiProperty({ type: String }) amount: string;
  @ApiProperty() currency: string;
  @ApiProperty({ nullable: true }) description?: string;
  @ApiProperty({ nullable: true }) referenceNumber?: string;
  @ApiProperty() status: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class FundingGrantResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() grantUid: string;
  @ApiProperty() grantId: string;
  @ApiProperty() collaborationId: string;
  @ApiProperty() partnerId: string;
  @ApiProperty({ type: () => GrantPartnerDto }) partner: GrantPartnerDto;
  @ApiProperty({ nullable: true, type: () => GrantProjectDto }) project?: GrantProjectDto;
  @ApiProperty({ nullable: true, type: () => GrantResourceContributionDto }) resourceContribution?: GrantResourceContributionDto;

  @ApiProperty() donorName: string;
  @ApiProperty({ type: String }) amount: string;
  @ApiProperty() currency: string;

  @ApiProperty({ nullable: true }) submissionDate?: Date;
  @ApiProperty({ nullable: true }) approvalDate?: Date;
  @ApiProperty({ nullable: true }) startDate?: Date;
  @ApiProperty({ nullable: true }) endDate?: Date;

  @ApiProperty() status: string;
  @ApiProperty({ nullable: true }) grantReferenceNumber?: string;
  @ApiProperty({ nullable: true }) description?: string;
  @ApiProperty({ nullable: true }) disbursementSchedule?: any;

  @ApiProperty({ type: () => GrantUserDto }) createdBy: GrantUserDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [GrantDisbursementResponseDto] }) disbursements?: GrantDisbursementResponseDto[];
}

// ─── Collaboration Document Response ──────────────────────────────

export class CollabDocumentItemDto {
  @ApiProperty() id: string;
  @ApiProperty() documentName: string;
  @ApiProperty() fileName: string;
  @ApiProperty() filePath: string;
  @ApiProperty() fileFormat: string;
}

export class CollaborationDocumentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() entityType: string;
  @ApiProperty() entityId: string;
  @ApiProperty() documentId: string;
  @ApiProperty({ type: () => CollabDocumentItemDto }) document: CollabDocumentItemDto;
  @ApiProperty() documentCategory: string;
  @ApiProperty() isCurrent: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

// ─── Approval History Response ────────────────────────────────────

export class ApprovalHistoryResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() entityType: string;
  @ApiProperty() entityId: string;
  @ApiProperty() action: string;
  @ApiProperty({ type: () => GrantUserDto }) actionBy: GrantUserDto;
  @ApiProperty() actionDate: Date;
  @ApiProperty({ nullable: true }) notes?: string;
  @ApiProperty({ nullable: true }) reason?: string;
  @ApiProperty() createdAt: Date;
}
