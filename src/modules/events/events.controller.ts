// src/modules/events/events.controller.ts
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
import { EventsService } from './events.service';
import {
  CreateEventDto,
  CreateParticipantDto,
  CreateEaiiParticipantDto,
  CreateBudgetDto,
} from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser('id') userId: string,
  ): Promise<EventResponseDto> {
    return this.eventsService.create(createEventDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async findAll(@Query() query: QueryEventsDto) {
    return this.eventsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.findOne(id);
  }

  @Get('record/:recordId')
  @ApiOperation({ summary: 'Get event by record ID' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findByRecordId(
    @Param('recordId') recordId: string,
  ): Promise<EventResponseDto> {
    return this.eventsService.findByRecordId(recordId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete event' })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.eventsService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted event' })
  @ApiResponse({
    status: 200,
    description: 'Event restored successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async restore(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.restore(id);
  }

  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participant to event' })
  @ApiResponse({
    status: 200,
    description: 'Participant added successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async addParticipant(
    @Param('id') id: string,
    @Body() participantData: CreateParticipantDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.addParticipant(id, participantData);
  }

  @Delete(':id/participants/:participantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove participant from event' })
  @ApiResponse({ status: 204, description: 'Participant removed successfully' })
  @ApiResponse({ status: 404, description: 'Participant not found' })
  async removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
  ): Promise<void> {
    await this.eventsService.removeParticipant(id, participantId);
  }

  @Post(':id/eaii-participants')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Add EAII participant to event' })
  @ApiResponse({
    status: 200,
    description: 'EAII participant added successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event or user not found' })
  async addEaiiParticipant(
    @Param('id') id: string,
    @Body() body: CreateEaiiParticipantDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.addEaiiParticipant(id, body.userId);
  }

  @Delete(':id/eaii-participants/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove EAII participant from event' })
  @ApiResponse({
    status: 204,
    description: 'EAII participant removed successfully',
  })
  @ApiResponse({ status: 404, description: 'EAII participant not found' })
  async removeEaiiParticipant(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.eventsService.removeEaiiParticipant(id, userId);
  }

  @Patch(':id/budget')
  @ApiOperation({ summary: 'Update event budget' })
  @ApiResponse({
    status: 200,
    description: 'Budget updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async updateBudget(
    @Param('id') id: string,
    @Body() budgetData: CreateBudgetDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.updateBudget(id, budgetData);
  }

  @Patch(':id/outcome')
  @ApiOperation({ summary: 'Update event outcome' })
  @ApiResponse({
    status: 200,
    description: 'Outcome updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async updateOutcome(
    @Param('id') id: string,
    @Body() outcomeData: any,
  ): Promise<EventResponseDto> {
    return this.eventsService.updateOutcome(id, outcomeData);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Verify event' })
  @ApiResponse({
    status: 200,
    description: 'Event verified successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async verifyEvent(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('notes') notes?: string,
  ): Promise<EventResponseDto> {
    return this.eventsService.verifyEvent(id, userId, notes);
  }

  @Patch(':id/review')
  @ApiOperation({ summary: 'Review event' })
  @ApiResponse({
    status: 200,
    description: 'Event reviewed successfully',
    type: EventResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async reviewEvent(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('notes') notes?: string,
  ): Promise<EventResponseDto> {
    return this.eventsService.reviewEvent(id, userId, notes);
  }
}
