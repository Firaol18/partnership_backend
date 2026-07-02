import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceContributionDto {
  @ApiProperty()
  resourceId: string;

  // EAII Contribution
  @ApiProperty({ required: false })
  eaiiStaff?: string;

  @ApiProperty({ required: false })
  eaiiInfrastructure?: string;

  @ApiProperty({ required: false })
  eaiiFunding?: number;

  @ApiProperty({ required: false })
  eaiiEquipment?: string;

  @ApiProperty({ required: false })
  eaiiDataResources?: string;

  // Partner Contribution
  @ApiProperty({ required: false })
  partnerStaff?: string;

  @ApiProperty({ required: false })
  partnerFunding?: number;

  @ApiProperty({ required: false })
  partnerTechnology?: string;

  @ApiProperty({ required: false })
  partnerEquipment?: string;

  @ApiProperty({ required: false })
  partnerExpertise?: string;

  // Estimated Value
  @ApiProperty({ required: false })
  estimatedMonetaryValue?: number;

  @ApiProperty({ required: false })
  estimatedInKindValue?: number;

  @ApiProperty({ required: false })
  currency?: string;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ required: false })
  partnerId?: string;

  @ApiProperty({ required: false })
  projectId?: string;
}
