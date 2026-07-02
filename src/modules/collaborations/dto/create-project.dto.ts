import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty()
  projectName: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  thematicArea?: string;

  @ApiProperty({ required: false })
  budget?: number;

  @ApiProperty({ required: false })
  fundingSource?: string;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  projectManager?: string;

  @ApiProperty({ required: false })
  partnerLead?: string;

  @ApiProperty({ required: false })
  teamMembers?: string[];

  @ApiProperty({ required: false })
  startDate?: string;

  @ApiProperty({ required: false })
  endDate?: string;

  @ApiProperty({ required: false })
  percentageComplete?: number;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  partnerId?: string;
}
