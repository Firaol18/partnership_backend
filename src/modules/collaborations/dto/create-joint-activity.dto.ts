import { ApiProperty } from '@nestjs/swagger';

export class CreateJointActivityDto {
  @ApiProperty()
  activityName: string;

  @ApiProperty()
  activityType: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  startDate?: string;

  @ApiProperty({ required: false })
  endDate?: string;

  @ApiProperty({ required: false })
  leadOrganization?: string;

  @ApiProperty()
  eaiiResponsibleUnit: string;

  @ApiProperty({ required: false })
  partnerResponsibleUnit?: string;

  @ApiProperty({ required: false })
  plannedOutputs?: any;

  @ApiProperty({ required: false })
  actualOutputs?: any;

  @ApiProperty({ required: false })
  partnerId?: string;
}
