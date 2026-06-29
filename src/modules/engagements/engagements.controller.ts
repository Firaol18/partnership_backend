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
import { EngagementsService } from './engagements.service';
import {
  CreateEngagementDto,
  CreateExternalParticipantDto,
  CreateEaiiRepresentativeDto,
} from './dto/create-engagement.dto';
import { UpdateEngagementDto } from './dto/update-engagement.dto';
import { QueryEngagementsDto } from './dto/query-engagements.dto';
import { EngagementResponseDto } from './dto/engagement-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Engagements')
@ApiBearerAuth()
@Controller('engagements')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class EngagementsController {
  constructor(private readonly engagementsService: EngagementsService) {}

  @Post()
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Create a new engagement' })
  @ApiResponse({
    status: 201,
    description: 'Engagement created successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Opportunity or engagement type not found',
  })
  async create(
    @Body() createEngagementDto: CreateEngagementDto,
    @CurrentUser('id') userId: string,
  ): Promise<EngagementResponseDto> {
    return this.engagementsService.create(createEngagementDto, userId);
  }

  @Get()
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all engagements with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Engagements retrieved successfully',
  })
  async findAll(@Query() query: QueryEngagementsDto) {
    return this.engagementsService.findAll(query);
  }

  @Get('opportunity/:opportunityId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all engagements for an opportunity' })
  @ApiResponse({
    status: 200,
    description: 'Engagements retrieved successfully',
    type: [EngagementResponseDto],
  })
  async findByOpportunity(
    @Param('opportunityId') opportunityId: string,
  ): Promise<EngagementResponseDto[]> {
    return this.engagementsService.findByOpportunity(opportunityId);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get engagement by ID' })
  @ApiResponse({
    status: 200,
    description: 'Engagement retrieved successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async findOne(@Param('id') id: string): Promise<EngagementResponseDto> {
    return this.engagementsService.findOne(id);
  }

  @Get('record/:recordId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get engagement by record ID' })
  @ApiResponse({
    status: 200,
    description: 'Engagement retrieved successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async findByRecordId(
    @Param('recordId') recordId: string,
  ): Promise<EngagementResponseDto> {
    return this.engagementsService.findByRecordId(recordId);
  }

  @Get('uid/:uid')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get engagement by UID' })
  @ApiResponse({
    status: 200,
    description: 'Engagement retrieved successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async findByUid(@Param('uid') uid: string): Promise<EngagementResponseDto> {
    return this.engagementsService.findByUid(uid);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update engagement' })
  @ApiResponse({
    status: 200,
    description: 'Engagement updated successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEngagementDto: UpdateEngagementDto,
  ): Promise<EngagementResponseDto> {
    return this.engagementsService.update(id, updateEngagementDto);
  }

  @Patch(':id/approve')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Approve engagement' })
  @ApiResponse({
    status: 200,
    description: 'Engagement approved successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async approve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('notes') notes?: string,
  ): Promise<EngagementResponseDto> {
    return this.engagementsService.approve(id, userId, notes);
  }

  @Patch(':id/complete')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Complete engagement' })
  @ApiResponse({
    status: 200,
    description: 'Engagement completed successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async complete(
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<EngagementResponseDto> {
    return this.engagementsService.complete(id, notes);
  }

  @Patch(':id/cancel')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cancel engagement' })
  @ApiResponse({
    status: 200,
    description: 'Engagement cancelled successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async cancel(
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ): Promise<EngagementResponseDto> {
    return this.engagementsService.cancel(id, notes);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete engagement' })
  @ApiResponse({ status: 204, description: 'Engagement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.engagementsService.remove(id);
  }

  // External Participants

  @Post(':id/external-participants')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Add external participant to engagement' })
  @ApiResponse({
    status: 200,
    description: 'External participant added successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async addExternalParticipant(
    @Param('id') id: string,
    @Body() participantData: CreateExternalParticipantDto,
  ): Promise<EngagementResponseDto> {
    return this.engagementsService.addExternalParticipant(id, participantData);
  }

  @Delete(':id/external-participants/:participantId')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove external participant from engagement' })
  @ApiResponse({
    status: 204,
    description: 'External participant removed successfully',
  })
  @ApiResponse({ status: 404, description: 'External participant not found' })
  async removeExternalParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
  ): Promise<void> {
    await this.engagementsService.removeExternalParticipant(id, participantId);
  }

  // EAII Representatives

  @Post(':id/eaii-representatives')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Add EAII representative to engagement' })
  @ApiResponse({
    status: 200,
    description: 'EAII representative added successfully',
    type: EngagementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Engagement not found' })
  async addEaiiRepresentative(
    @Param('id') id: string,
    @Body() repData: CreateEaiiRepresentativeDto,
  ): Promise<EngagementResponseDto> {
    return this.engagementsService.addEaiiRepresentative(id, repData);
  }

  @Delete(':id/eaii-representatives/:repId')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove EAII representative from engagement' })
  @ApiResponse({
    status: 204,
    description: 'EAII representative removed successfully',
  })
  @ApiResponse({ status: 404, description: 'EAII representative not found' })
  async removeEaiiRepresentative(
    @Param('id') id: string,
    @Param('repId') repId: string,
  ): Promise<void> {
    await this.engagementsService.removeEaiiRepresentative(id, repId);
  }
}
