// src/modules/engagements/dto/engagement-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class EngagementTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  typeName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class ExternalParticipantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  organizationName: string;

  @ApiProperty({ nullable: true })
  position?: string;

  @ApiProperty({ nullable: true })
  email?: string;

  @ApiProperty({ nullable: true })
  phoneNumber?: string;
}

export class EaiiRepresentativeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  userId?: string;

  @ApiProperty()
  division: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  role?: string;
}

export class EngagementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  engagementUid: string;

  @ApiProperty()
  recordId: string;

  @ApiProperty()
  opportunityId: string;

  @ApiProperty({ type: EngagementTypeResponseDto })
  engagementType: EngagementTypeResponseDto;

  @ApiProperty()
  engagementDate: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ nullable: true })
  location?: string;

  @ApiProperty({ nullable: true })
  startTime?: string;

  @ApiProperty({ nullable: true })
  endTime?: string;

  @ApiProperty()
  keyPoints: string;

  @ApiProperty()
  agreedActions: string;

  @ApiProperty()
  nextSteps: string;

  @ApiProperty()
  followUpRequired: boolean;

  @ApiProperty({ nullable: true })
  followUpDate?: string;

  @ApiProperty({ nullable: true })
  followUpNotes?: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true })
  approvalNotes?: string;

  @ApiProperty({ nullable: true })
  approvalDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ExternalParticipantResponseDto] })
  externalParticipants?: ExternalParticipantResponseDto[];

  @ApiProperty({ type: [EaiiRepresentativeResponseDto] })
  eaiiRepresentatives?: EaiiRepresentativeResponseDto[];

  @ApiProperty()
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({ nullable: true })
  approvedBy?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({ nullable: true })
  opportunity?: {
    id: string;
    title: string;
    partnerName: string;
  };
}
