import { ApiProperty } from '@nestjs/swagger';

export class CreateFundingGrantDto {
  @ApiProperty()
  grantId: string;

  @ApiProperty()
  donorName: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty({ required: false })
  submissionDate?: string;

  @ApiProperty({ required: false })
  approvalDate?: string;

  @ApiProperty({ required: false })
  endDate?: string;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  partnerId?: string;
}
