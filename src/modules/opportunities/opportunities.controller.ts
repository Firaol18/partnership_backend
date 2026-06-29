// src/modules/opportunities/opportunities.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { QueryOpportunitiesDto } from './dto/query-opportunities.dto';
import { OpportunityResponseDto } from './dto/opportunity-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Opportunities')
@ApiBearerAuth()
@Controller('opportunities')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new opportunity' })
  @ApiResponse({
    status: 201,
    description: 'Opportunity created successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() createOpportunityDto: CreateOpportunityDto,
    @CurrentUser('id') userId: string,
  ): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.create(createOpportunityDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all opportunities with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Opportunities retrieved successfully',
  })
  async findAll(@Query() query: QueryOpportunitiesDto) {
    return this.opportunitiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get opportunity by ID' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity retrieved successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  async findOne(@Param('id') id: string): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.findOne(id);
  }

  @Get('uid/:uid')
  @ApiOperation({ summary: 'Get opportunity by UID' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity retrieved successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  async findByUid(@Param('uid') uid: string): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.findByUid(uid);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update opportunity' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity updated successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot update converted opportunity',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
  ): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.update(id, updateOpportunityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete opportunity' })
  @ApiResponse({ status: 204, description: 'Opportunity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete converted opportunity',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.opportunitiesService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted opportunity' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity restored successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  async restore(@Param('id') id: string): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.restore(id);
  }

  // Workflow Actions

  @Patch(':id/screen')
  @ApiOperation({ summary: 'Screen opportunity (Draft → Under Review)' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity screened successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiResponse({
    status: 400,
    description: 'Only draft opportunities can be screened',
  })
  async screen(@Param('id') id: string): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.screen(id);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify opportunity (Under Review → Verified)' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity verified successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiResponse({
    status: 400,
    description: 'Only opportunities under review can be verified',
  })
  async verify(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('notes') notes?: string,
  ): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.verify(id, userId, notes);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Review opportunity (Under Review → Reviewed)' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity reviewed successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiResponse({
    status: 400,
    description: 'Only opportunities under review can be reviewed',
  })
  async review(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('notes') notes?: string,
  ): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.review(id, userId, notes);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve opportunity (Under Review → Approved)' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity approved successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiResponse({
    status: 400,
    description: 'Only opportunities under review can be approved',
  })
  async approve(
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.approve(id, notes);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject opportunity (Under Review → Rejected)' })
  @ApiResponse({
    status: 200,
    description: 'Opportunity rejected successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiResponse({
    status: 400,
    description: 'Only opportunities under review can be rejected',
  })
  async reject(
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.reject(id, notes);
  }

  @Patch(':id/convert')
  @ApiOperation({
    summary: 'Convert opportunity to entity (Approved → Converted)',
  })
  @ApiResponse({
    status: 200,
    description: 'Opportunity converted successfully',
    type: OpportunityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Opportunity not found' })
  @ApiResponse({
    status: 400,
    description: 'Only approved opportunities can be converted',
  })
  async convert(
    @Param('id') id: string,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
  ): Promise<OpportunityResponseDto> {
    return this.opportunitiesService.convert(id, entityType, entityId);
  }
}
