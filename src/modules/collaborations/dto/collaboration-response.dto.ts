import { ApiProperty } from '@nestjs/swagger';

export class CollaborationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  collaborationUid: string;

  @ApiProperty()
  collaborationId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  collaborationType: string;

  @ApiProperty({ required: false })
  startDate?: string;

  @ApiProperty({ required: false })
  endDate?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  partnerId: string;

  @ApiProperty({ required: false })
  agreementId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;

  @ApiProperty({ required: false })
  createdBy?: any;

  @ApiProperty({ required: false })
  jointActivities?: any[];

  @ApiProperty({ required: false })
  projects?: any[];

  @ApiProperty({ required: false })
  resourceContributions?: any[];

  @ApiProperty({ required: false })
  fundingGrants?: any[];
}
