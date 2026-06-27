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
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';

import { QueryPermissionsDto } from './dto/query-permissions.dto';
import {
  PermissionResponseDto,
  PermissionWithRolesDto,
} from './dto/permission-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all permissions with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
  })
  async findAll(@Query() query: QueryPermissionsDto) {
    return this.permissionsService.findAll(query);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all active permissions (simple list)' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [PermissionResponseDto],
  })
  async findAllSimple(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findAllSimple();
  }

  @Get('resources')
  @ApiOperation({ summary: 'Get all unique resources' })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  async getResources(): Promise<string[]> {
    return this.permissionsService.getResources();
  }

  @Get('resources/:resource/actions')
  @ApiOperation({ summary: 'Get all actions for a specific resource' })
  @ApiResponse({ status: 200, description: 'Actions retrieved successfully' })
  async getActionsByResource(
    @Param('resource') resource: string,
  ): Promise<string[]> {
    return this.permissionsService.getActionsByResource(resource);
  }

  @Get('resource/:resource')
  @ApiOperation({ summary: 'Get permissions by resource' })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [PermissionResponseDto],
  })
  async getPermissionsByResource(
    @Param('resource') resource: string,
  ): Promise<PermissionResponseDto[]> {
    return this.permissionsService.getPermissionsByResource(resource);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID with roles' })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
    type: PermissionWithRolesDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PermissionWithRolesDto> {
    return this.permissionsService.findOne(id);
  }

  @Get('resource/:resource/action/:action')
  @ApiOperation({ summary: 'Get permission by resource and action' })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findByResourceAction(
    @Param('resource') resource: string,
    @Param('action') action: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.findByResourceAction(resource, action);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Get all roles with this permission' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async getRolesWithPermission(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionsService.getRolesWithPermission(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission activated successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 400, description: 'Permission is already active' })
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission deactivated successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({
    status: 400,
    description: 'Permission is already inactive or has active users',
  })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.deactivate(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle permission active status' })
  @ApiResponse({
    status: 200,
    description: 'Permission status toggled successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete permission' })
  @ApiResponse({ status: 204, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete permission with active users',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.permissionsService.remove(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete permission' })
  @ApiResponse({ status: 204, description: 'Permission permanently deleted' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete permission assigned to roles',
  })
  async permanentRemove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.permissionsService.permanentRemove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore deleted permission' })
  @ApiResponse({
    status: 200,
    description: 'Permission restored successfully',
    type: PermissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiResponse({ status: 400, description: 'Permission is not deleted' })
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.restore(id);
  }
}
