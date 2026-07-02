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
import { CollaborationsService } from './collaborations.service';
import { CreateCollaborationDto } from './dto/create-collaboration.dto';
import { UpdateCollaborationDto } from './dto/update-collaboration.dto';
import { QueryCollaborationsDto } from './dto/query-collaborations.dto';
import { CollaborationResponseDto } from './dto/collaboration-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Collaborations')
@ApiBearerAuth()
@Controller('collaborations')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new collaboration' })
  @ApiResponse({
    status: 201,
    description: 'Collaboration created successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Roles('focal_person', 'officer', 'division_director')
  async create(
    @Body() createCollaborationDto: CreateCollaborationDto,
    @CurrentUser('id') userId: string,
  ): Promise<CollaborationResponseDto> {
    return this.collaborationsService.create(createCollaborationDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all collaborations with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Collaborations retrieved successfully',
  })
  async findAll(@Query() query: QueryCollaborationsDto) {
    return this.collaborationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collaboration by ID' })
  @ApiResponse({
    status: 200,
    description: 'Collaboration retrieved successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  async findOne(@Param('id') id: string): Promise<CollaborationResponseDto> {
    return this.collaborationsService.findOne(id);
  }

  @Get('uid/:uid')
  @ApiOperation({ summary: 'Get collaboration by UID' })
  @ApiResponse({
    status: 200,
    description: 'Collaboration retrieved successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  async findByUid(@Param('uid') uid: string): Promise<CollaborationResponseDto> {
    return this.collaborationsService.findByUid(uid);
  }

  @Get('collaboration-id/:collaborationId')
  @ApiOperation({ summary: 'Get collaboration by collaboration ID (COL-YYYY-XXXX)' })
  @ApiResponse({
    status: 200,
    description: 'Collaboration retrieved successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  async findByCollaborationId(
    @Param('collaborationId') collaborationId: string,
  ): Promise<CollaborationResponseDto> {
    return this.collaborationsService.findByCollaborationId(collaborationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update collaboration' })
  @ApiResponse({
    status: 200,
    description: 'Collaboration updated successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @Roles('focal_person', 'officer', 'division_director')
  async update(
    @Param('id') id: string,
    @Body() updateCollaborationDto: UpdateCollaborationDto,
  ): Promise<CollaborationResponseDto> {
    return this.collaborationsService.update(id, updateCollaborationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete collaboration' })
  @ApiResponse({ status: 204, description: 'Collaboration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @Roles('focal_person', 'officer', 'division_director')
  async remove(@Param('id') id: string): Promise<void> {
    await this.collaborationsService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted collaboration' })
  @ApiResponse({
    status: 200,
    description: 'Collaboration restored successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @Roles('division_director')
  async restore(@Param('id') id: string): Promise<CollaborationResponseDto> {
    return this.collaborationsService.restore(id);
  }

  // Workflow Actions - Director Approval

  @Patch(':id/approve')
  @ApiOperation({ 
    summary: 'Approve collaboration (Planned → Ongoing)',
    description: 'Responsible Division Director approves the collaboration to start'
  })
  @ApiResponse({
    status: 200,
    description: 'Collaboration approved successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @ApiResponse({
    status: 400,
    description: 'Only planned collaborations can be approved',
  })
  @Roles('division_director')
  async approve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('notes') notes?: string,
  ): Promise<CollaborationResponseDto> {
    return this.collaborationsService.approve(id, userId, notes);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark collaboration as completed (Ongoing → Completed)' })
  @ApiResponse({
    status: 200,
    description: 'Collaboration completed successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @ApiResponse({
    status: 400,
    description: 'Only ongoing collaborations can be completed',
  })
  @Roles('focal_person', 'officer', 'division_director')
  async complete(
    @Param('id') id: string,
  ): Promise<CollaborationResponseDto> {
    return this.collaborationsService.complete(id);
  }

  @Patch(':id/delay')
  @ApiOperation({ summary: 'Mark collaboration as delayed (Ongoing → Delayed)' })
  @ApiResponse({
    status: 200,
    description: 'Collaboration delayed successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @ApiResponse({
    status: 400,
    description: 'Only ongoing collaborations can be delayed',
  })
  @Roles('focal_person', 'officer', 'division_director')
  async delay(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<CollaborationResponseDto> {
    return this.collaborationsService.delay(id, reason);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel collaboration' })
  @ApiResponse({
    status: 200,
    description: 'Collaboration cancelled successfully',
    type: CollaborationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collaboration not found' })
  @Roles('division_director')
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<CollaborationResponseDto> {
    return this.collaborationsService.cancel(id, reason);
  }
}
