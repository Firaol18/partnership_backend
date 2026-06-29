// src/modules/communications/communications.controller.ts
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
import { CommunicationsService } from './communications.service';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { UpdateCommunicationDto } from './dto/update-communication.dto';
import { QueryCommunicationsDto } from './dto/query-communications.dto';
import { CommunicationResponseDto } from './dto/communication-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Communications')
@ApiBearerAuth()
@Controller('communications')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class CommunicationsController {
  constructor(private readonly communicationsService: CommunicationsService) {}

  @Post()
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Create a new communication' })
  @ApiResponse({
    status: 201,
    description: 'Communication created successfully',
    type: CommunicationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Opportunity or communication type not found',
  })
  async create(
    @Body() createCommunicationDto: CreateCommunicationDto,
    @CurrentUser('id') userId: string,
  ): Promise<CommunicationResponseDto> {
    return this.communicationsService.create(createCommunicationDto, userId);
  }

  @Get()
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({
    summary: 'Get all communications with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Communications retrieved successfully',
  })
  async findAll(@Query() query: QueryCommunicationsDto) {
    return this.communicationsService.findAll(query);
  }

  @Get('opportunity/:opportunityId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all communications for an opportunity' })
  @ApiResponse({
    status: 200,
    description: 'Communications retrieved successfully',
    type: [CommunicationResponseDto],
  })
  async findByOpportunity(
    @Param('opportunityId') opportunityId: string,
  ): Promise<CommunicationResponseDto[]> {
    return this.communicationsService.findByOpportunity(opportunityId);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get communication by ID' })
  @ApiResponse({
    status: 200,
    description: 'Communication retrieved successfully',
    type: CommunicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  async findOne(@Param('id') id: string): Promise<CommunicationResponseDto> {
    return this.communicationsService.findOne(id);
  }

  @Get('uid/:uid')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get communication by UID' })
  @ApiResponse({
    status: 200,
    description: 'Communication retrieved successfully',
    type: CommunicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  async findByUid(
    @Param('uid') uid: string,
  ): Promise<CommunicationResponseDto> {
    return this.communicationsService.findByUid(uid);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update communication' })
  @ApiResponse({
    status: 200,
    description: 'Communication updated successfully',
    type: CommunicationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCommunicationDto: UpdateCommunicationDto,
  ): Promise<CommunicationResponseDto> {
    return this.communicationsService.update(id, updateCommunicationDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete communication' })
  @ApiResponse({
    status: 204,
    description: 'Communication deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Communication not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.communicationsService.remove(id);
  }
}
