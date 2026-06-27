// src/modules/events/dto/event-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class EventTypeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  typeName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class EventCategoryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  categoryName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class EventModeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  modeName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class ParticipantResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  participantUid: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  organizationName: string;

  @ApiProperty({ nullable: true })
  position?: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  phoneNumber?: string;

  @ApiProperty({ nullable: true })
  participantType?: string;
}

export class EaiiParticipantResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  user: {
    id: number;
    fullName: string;
    email: string;
    position?: string;
  };
}

export class BudgetResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  budgetUid: string;

  @ApiProperty({ nullable: true })
  estimatedBudget?: number;

  @ApiProperty({ nullable: true })
  actualBudget?: number;

  @ApiProperty({ nullable: true })
  fundingSource?: string;
}

export class OutcomeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  outcomeUid: string;

  @ApiProperty({ nullable: true })
  keyDiscussions?: string;

  @ApiProperty({ nullable: true })
  agreementsReached?: string;

  @ApiProperty({ nullable: true })
  actionPoints?: string;

  @ApiProperty({ nullable: true })
  objectivesAchieved?: string;

  @ApiProperty({ nullable: true })
  recommendations?: string;
}

export class EventResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  eventUid: string;

  @ApiProperty()
  recordId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  eventName: string;

  @ApiProperty({ type: EventTypeResponseDto })
  eventType: EventTypeResponseDto;

  @ApiProperty({ type: EventCategoryResponseDto })
  eventCategory: EventCategoryResponseDto;

  @ApiProperty()
  eventDate: string;

  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  venue: string;

  @ApiProperty({ nullable: true })
  organizer?: string;

  @ApiProperty({ nullable: true })
  coOrganizer?: string;

  @ApiProperty({ type: EventModeResponseDto })
  eventMode: EventModeResponseDto;

  @ApiProperty({ nullable: true })
  partnerId?: number;

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

  @ApiProperty({ type: [ParticipantResponseDto] })
  participants?: ParticipantResponseDto[];

  @ApiProperty({ type: [EaiiParticipantResponseDto] })
  eaiiParticipants?: EaiiParticipantResponseDto[];

  @ApiProperty({ type: BudgetResponseDto, nullable: true })
  budget?: BudgetResponseDto;

  @ApiProperty({ type: [OutcomeResponseDto] })
  outcomes?: OutcomeResponseDto[];

  @ApiProperty()
  createdBy: {
    id: number;
    fullName: string;
    email: string;
  };
}
