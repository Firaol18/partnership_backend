// src/modules/collaborations/dto/resource-contribution-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ResourcePartnerDto {
  @ApiProperty() id: string;
  @ApiProperty() partnerName: string;
  @ApiProperty() partnerId: string;
}

export class ResourceProjectDto {
  @ApiProperty() id: string;
  @ApiProperty() projectName: string;
  @ApiProperty() projectId: string;
}

export class ResourceUserDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() email: string;
}

export class ResourceContributionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() resourceUid: string;
  @ApiProperty() resourceId: string;
  @ApiProperty() collaborationId: string;
  @ApiProperty() partnerId: string;
  @ApiProperty({ type: () => ResourcePartnerDto }) partner: ResourcePartnerDto;
  @ApiProperty({ nullable: true, type: () => ResourceProjectDto }) project?: ResourceProjectDto;

  // EAII Contribution
  @ApiProperty({ nullable: true }) eaiiStaff?: string;
  @ApiProperty({ nullable: true }) eaiiInfrastructure?: string;
  @ApiProperty({ nullable: true, type: String }) eaiiFunding?: string;
  @ApiProperty({ nullable: true }) eaiiEquipment?: string;
  @ApiProperty({ nullable: true }) eaiiDataResources?: string;

  // Partner Contribution
  @ApiProperty({ nullable: true }) partnerStaff?: string;
  @ApiProperty({ nullable: true, type: String }) partnerFunding?: string;
  @ApiProperty({ nullable: true }) partnerTechnology?: string;
  @ApiProperty({ nullable: true }) partnerEquipment?: string;
  @ApiProperty({ nullable: true }) partnerExpertise?: string;

  // Estimated Value
  @ApiProperty({ nullable: true, type: String }) estimatedMonetaryValue?: string;
  @ApiProperty({ nullable: true, type: String }) estimatedInKindValue?: string;
  @ApiProperty({ nullable: true }) currency?: string;

  @ApiProperty() status: string;
  @ApiProperty({ type: () => ResourceUserDto }) createdBy: ResourceUserDto;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
