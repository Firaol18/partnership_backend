import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DivisionsService } from './divisions.service';
import { CreateDivisionDto } from './dto/create-division.dto';
import { UpdateDivisionDto } from './dto/update-division.dto';
import { DivisionResponseDto } from './dto/division-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Divisions')
@ApiBearerAuth()
@Controller('divisions')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class DivisionsController {
  constructor(private readonly divisionsService: DivisionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new division' })
  @ApiResponse({
    status: 201,
    description: 'Division created successfully',
    type: DivisionResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Division already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() createDivisionDto: CreateDivisionDto,
  ): Promise<DivisionResponseDto> {
    return this.divisionsService.create(createDivisionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all divisions' })
  @ApiResponse({
    status: 200,
    description: 'Divisions retrieved successfully',
    type: [DivisionResponseDto],
  })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean })
  async findAll(
    @Query('includeDeleted') includeDeleted?: boolean,
  ): Promise<DivisionResponseDto[]> {
    return this.divisionsService.findAll(includeDeleted);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get division by ID' })
  @ApiResponse({
    status: 200,
    description: 'Division retrieved successfully',
    type: DivisionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Division not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DivisionResponseDto> {
    return this.divisionsService.findOne(id);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get all users in a division' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Division not found' })
  async getDivisionUsers(@Param('id', ParseUUIDPipe) id: string) {
    return this.divisionsService.getDivisionUsers(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update division' })
  @ApiResponse({
    status: 200,
    description: 'Division updated successfully',
    type: DivisionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Division not found' })
  @ApiResponse({ status: 409, description: 'Division name already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDivisionDto: UpdateDivisionDto,
  ): Promise<DivisionResponseDto> {
    return this.divisionsService.update(id, updateDivisionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete division' })
  @ApiResponse({ status: 204, description: 'Division deleted successfully' })
  @ApiResponse({ status: 404, description: 'Division not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete division that has users',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.divisionsService.remove(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete division' })
  @ApiResponse({ status: 204, description: 'Division permanently deleted' })
  @ApiResponse({ status: 404, description: 'Division not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete division that has users',
  })
  async permanentRemove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.divisionsService.permanentRemove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted division' })
  @ApiResponse({
    status: 200,
    description: 'Division restored successfully',
    type: DivisionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Division not found' })
  @ApiResponse({ status: 400, description: 'Division is not deleted' })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DivisionResponseDto> {
    return this.divisionsService.restore(id);
  }

  @Post(':id/director/:userId')
  @ApiOperation({ summary: 'Assign director to division' })
  @ApiResponse({
    status: 200,
    description: 'Director assigned successfully',
    type: DivisionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Division or user not found' })
  async assignDirector(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<DivisionResponseDto> {
    return this.divisionsService.assignDirector(id, userId);
  }

  @Delete(':id/director')
  @ApiOperation({ summary: 'Remove director from division' })
  @ApiResponse({
    status: 200,
    description: 'Director removed successfully',
    type: DivisionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Division not found' })
  async removeDirector(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DivisionResponseDto> {
    return this.divisionsService.removeDirector(id);
  }
}
