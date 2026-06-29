// src/modules/communications/dto/communication-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CommunicationTypeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  typeName: string;

  @ApiProperty({ nullable: true })
  description?: string;
}

export class CommunicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  communicationUid: string;

  @ApiProperty()
  opportunityId: string;

  @ApiProperty({ type: CommunicationTypeResponseDto })
  communicationType: CommunicationTypeResponseDto;

  @ApiProperty()
  emailSubject: string;

  @ApiProperty()
  emailRecipient: string;

  @ApiProperty()
  emailBody: string;

  @ApiProperty()
  sentDate: Date;

  @ApiProperty({ nullable: true })
  ccRecipients?: string;

  @ApiProperty({ nullable: true })
  bccRecipients?: string;

  @ApiProperty()
  hasAttachments: boolean;

  @ApiProperty()
  sentBy: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  opportunity?: {
    id: string;
    title: string;
    partnerName: string;
  };
}
