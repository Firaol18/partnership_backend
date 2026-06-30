// src/modules/collaborations/dto/collaboration-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CollaborationPartnerDto {
  @ApiProperty() id: string;
  @ApiProperty() partnerName: string;
  @ApiProperty() partnerId: string;
}

export class CollaborationUserDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() email: string;
}

export class CollaborationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() collaborationUid: string;
  @ApiProperty() collaborationId: string;
  @ApiProperty() partnerId: string;
  @ApiProperty({ type: () => CollaborationPartnerDto }) partner: CollaborationPartnerDto;
  @ApiProperty({ nullable: true }) agreementId?: string;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description?: string;
  @ApiProperty() collaborationType: string;
  @ApiProperty({ nullable: true }) startDate?: Date;
  @ApiProperty({ nullable: true }) endDate?: Date;
  @ApiProperty() status: string;
  @ApiProperty({ type: () => CollaborationUserDto }) createdBy: CollaborationUserDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() _count?: { activities: number };
}

// ─── Joint Activity Response ─────────────────────────────────────

export class ActivityOutputResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() outputUid: string;
  @ApiProperty() activityId: string;
  @ApiProperty() outputType: string;
  @ApiProperty() outputDescription: string;
  @ApiProperty({ nullable: true }) quantity?: number;
  @ApiProperty({ nullable: true }) unit?: string;
  @ApiProperty({ nullable: true }) completionDate?: Date;
  @ApiProperty() status: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class JointActivityResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() activityUid: string;
  @ApiProperty() activityId: string;
  @ApiProperty() collaborationId: string;
  @ApiProperty() partnerId: string;
  @ApiProperty({ type: () => CollaborationPartnerDto }) partner: CollaborationPartnerDto;
  @ApiProperty() activityName: string;
  @ApiProperty() activityType: string;
  @ApiProperty({ nullable: true }) description?: string;
  @ApiProperty({ nullable: true }) startDate?: Date;
  @ApiProperty({ nullable: true }) endDate?: Date;
  @ApiProperty() leadOrganizationId: string;
  @ApiProperty({ type: () => CollaborationPartnerDto }) leadOrganization: CollaborationPartnerDto;
  @ApiProperty() eaiiResponsibleUnit: string;
  @ApiProperty({ nullable: true }) partnerResponsibleUnit?: string;
  @ApiProperty({ nullable: true }) plannedOutputs?: any;
  @ApiProperty({ nullable: true }) actualOutputs?: any;
  @ApiProperty() approvalStatus: string;
  @ApiProperty({ nullable: true }) approvalReason?: string;
  @ApiProperty({ type: () => CollaborationUserDto, nullable: true }) approvedBy?: CollaborationUserDto;
  @ApiProperty({ nullable: true }) approvedAt?: Date;
  @ApiProperty({ type: () => CollaborationUserDto, nullable: true }) reviewer?: CollaborationUserDto;
  @ApiProperty({ nullable: true }) reviewNotes?: string;
  @ApiProperty({ nullable: true }) reviewDate?: Date;
  @ApiProperty({ type: () => CollaborationUserDto, nullable: true }) verifier?: CollaborationUserDto;
  @ApiProperty({ nullable: true }) verificationNotes?: string;
  @ApiProperty({ nullable: true }) verificationDate?: Date;
  @ApiProperty() verifiedStatus: string;
  @ApiProperty() status: string;
  @ApiProperty({ type: () => CollaborationUserDto }) createdBy: CollaborationUserDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: [ActivityOutputResponseDto] }) outputs?: ActivityOutputResponseDto[];
}
