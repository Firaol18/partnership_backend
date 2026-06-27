// src/modules/visits/visits.controller.ts
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
import { VisitsService } from './visits.service';
import { CreateVisitDto, CreateDelegateDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { QueryVisitsDto } from './dto/query-visits.dto';
import { VisitResponseDto } from './dto/visit-response.dto';
import { CreateVisitOutcomeDto } from './dto/visit-outcome.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Visits')
@ApiBearerAuth()
@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new visit' })
  @ApiResponse({
    status: 201,
    description: 'Visit created successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() createVisitDto: CreateVisitDto,
    @CurrentUser('id') userId: string,
  ): Promise<VisitResponseDto> {
    return this.visitsService.create(createVisitDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all visits with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Visits retrieved successfully' })
  async findAll(@Query() query: QueryVisitsDto) {
    return this.visitsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get visit by ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit retrieved successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async findOne(@Param('id') id: string): Promise<VisitResponseDto> {
    return this.visitsService.findOne(id);
  }

  @Get('record/:recordId')
  @ApiOperation({ summary: 'Get visit by record ID' })
  @ApiResponse({
    status: 200,
    description: 'Visit retrieved successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async findByRecordId(
    @Param('recordId') recordId: string,
  ): Promise<VisitResponseDto> {
    return this.visitsService.findByRecordId(recordId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update visit' })
  @ApiResponse({
    status: 200,
    description: 'Visit updated successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async update(
    @Param('id') id: string,
    @Body() updateVisitDto: UpdateVisitDto,
  ): Promise<VisitResponseDto> {
    return this.visitsService.update(id, updateVisitDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete visit' })
  @ApiResponse({ status: 204, description: 'Visit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.visitsService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted visit' })
  @ApiResponse({
    status: 200,
    description: 'Visit restored successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async restore(@Param('id') id: string): Promise<VisitResponseDto> {
    return this.visitsService.restore(id);
  }

  @Post(':id/delegates')
  @ApiOperation({ summary: 'Add delegate to visit' })
  @ApiResponse({
    status: 200,
    description: 'Delegate added successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async addDelegate(
    @Param('id') id: string,
    @Body() delegateData: CreateDelegateDto,
  ): Promise<VisitResponseDto> {
    return this.visitsService.addDelegate(id, delegateData);
  }

  @Delete(':id/delegates/:delegateId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove delegate from visit' })
  @ApiResponse({ status: 204, description: 'Delegate removed successfully' })
  @ApiResponse({ status: 404, description: 'Delegate not found' })
  async removeDelegate(
    @Param('id') id: string,
    @Param('delegateId') delegateId: string,
  ): Promise<void> {
    await this.visitsService.removeDelegate(id, delegateId);
  }

  @Patch('delegates/:delegateId/status')
  @ApiOperation({ summary: 'Update delegate status' })
  @ApiResponse({
    status: 200,
    description: 'Delegate status updated successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Delegate not found' })
  async updateDelegateStatus(
    @Param('delegateId') delegateId: string,
    @Body('status') status: string,
  ): Promise<VisitResponseDto> {
    return this.visitsService.updateDelegateStatus(delegateId, status);
  }

  @Get(':id/outcomes')
  @ApiOperation({ summary: 'Get all outcomes for a visit' })
  @ApiResponse({ status: 200, description: 'Outcomes retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async findOutcomes(@Param('id') id: string) {
    return this.visitsService.findOutcomes(id);
  }

  @Post(':id/outcomes')
  @ApiOperation({ summary: 'Add outcome to visit' })
  @ApiResponse({
    status: 200,
    description: 'Outcome created successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async createOutcome(
    @Param('id') id: string,
    @Body() outcomeData: CreateVisitOutcomeDto,
  ): Promise<VisitResponseDto> {
    return this.visitsService.createOutcome(id, outcomeData);
  }

  @Patch(':id/outcomes/:outcomeId')
  @ApiOperation({ summary: 'Update visit outcome' })
  @ApiResponse({
    status: 200,
    description: 'Outcome updated successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Outcome not found' })
  async updateOutcome(
    @Param('id') id: string,
    @Param('outcomeId') outcomeId: string,
    @Body() outcomeData: CreateVisitOutcomeDto,
  ): Promise<VisitResponseDto> {
    return this.visitsService.updateOutcome(id, outcomeId, outcomeData);
  }

  @Delete(':id/outcomes/:outcomeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete visit outcome' })
  @ApiResponse({ status: 204, description: 'Outcome deleted successfully' })
  @ApiResponse({ status: 404, description: 'Outcome not found' })
  async removeOutcome(
    @Param('id') id: string,
    @Param('outcomeId') outcomeId: string,
  ): Promise<void> {
    await this.visitsService.removeOutcome(id, outcomeId);
  }

  @Patch(':id/outcome')
  @ApiOperation({ summary: 'Update visit outcome (legacy)' })
  @ApiResponse({
    status: 200,
    description: 'Outcome updated successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async updateOutcomeLegacy(
    @Param('id') id: string,
    @Body() outcomeData: any,
  ): Promise<VisitResponseDto> {
    const outcomes = await this.visitsService.findOutcomes(id);
    const firstOutcome = outcomes[0];
    if (firstOutcome) {
      return this.visitsService.updateOutcome(id, firstOutcome.id, outcomeData);
    }
    return this.visitsService.createOutcome(id, outcomeData);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify visit' })
  @ApiResponse({
    status: 200,
    description: 'Visit verified successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async verifyVisit(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('notes') notes?: string,
  ): Promise<VisitResponseDto> {
    return this.visitsService.verifyVisit(id, userId, notes);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Review visit' })
  @ApiResponse({
    status: 200,
    description: 'Visit reviewed successfully',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visit not found' })
  async reviewVisit(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('notes') notes?: string,
  ): Promise<VisitResponseDto> {
    return this.visitsService.reviewVisit(id, userId, notes);
  }
}
