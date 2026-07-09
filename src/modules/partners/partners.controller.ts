// src/modules/partners/partners.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ReviewPartnerDto } from './dto/review-partner.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateFocalPersonDto } from './dto/create-focal-person.dto';
import { QueryPartnersDto } from './dto/query-partners.dto';
import { PartnerResponseDto } from './dto/partner-response.dto';
import { CreateOrganizationTypeDto, UpdateOrganizationTypeDto } from './dto/organization-type.dto';
import { CreatePartnerClassificationDto, UpdatePartnerClassificationDto } from './dto/partner-classification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Partners')
@ApiBearerAuth()
@Controller('partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  // ─── CRUD ─────────────────────────────────────────────────────

  @Post()
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Register a new partner (FORMAL or DIRECT path)' })
  @ApiResponse({ status: 201, type: PartnerResponseDto })
  create(
    @Body() dto: CreatePartnerDto,
    @CurrentUser('id') userId: string,
  ): Promise<PartnerResponseDto> {
    return this.partnersService.create(dto, userId);
  }

  @Get()
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all partners with pagination and filters' })
  findAll(@Query() query: QueryPartnersDto) {
    return this.partnersService.findAll(query);
  }

  // ─── ORGANIZATION TYPE MANAGEMENT ──────────────────────────────

  @Get('lookup/organization-types')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all organization types' })
  @ApiResponse({ status: 200, description: 'Organization types retrieved successfully' })
  getOrganizationTypes() {
    return this.partnersService.getOrganizationTypes();
  }

  @Post('lookup/organization-types')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new organization type' })
  @ApiResponse({ status: 201, description: 'Organization type created successfully' })
  @ApiResponse({ status: 400, description: 'Organization type already exists' })
  createOrganizationType(@Body() dto: CreateOrganizationTypeDto) {
    return this.partnersService.createOrganizationType(dto);
  }

  @Get('lookup/organization-types/:id')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get a single organization type by ID' })
  @ApiResponse({ status: 200, description: 'Organization type retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization type not found' })
  getOrganizationType(@Param('id') id: string) {
    return this.partnersService.getOrganizationType(id);
  }

  @Patch('lookup/organization-types/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update an organization type' })
  @ApiResponse({ status: 200, description: 'Organization type updated successfully' })
  @ApiResponse({ status: 404, description: 'Organization type not found' })
  @ApiResponse({ status: 400, description: 'Name already taken' })
  updateOrganizationType(@Param('id') id: string, @Body() dto: UpdateOrganizationTypeDto) {
    return this.partnersService.updateOrganizationType(id, dto);
  }

  @Delete('lookup/organization-types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete an organization type (soft delete)' })
  @ApiResponse({ status: 204, description: 'Organization type deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete: type is in use by active partners' })
  deleteOrganizationType(@Param('id') id: string) {
    return this.partnersService.deleteOrganizationType(id);
  }

  // ─── PARTNER CLASSIFICATION MANAGEMENT ───────────────────────

  @Get('lookup/classifications')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all partner classifications' })
  @ApiResponse({ status: 200, description: 'Classifications retrieved successfully' })
  getPartnerClassifications() {
    return this.partnersService.getPartnerClassifications();
  }

  @Post('lookup/classifications')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new partner classification' })
  @ApiResponse({ status: 201, description: 'Classification created successfully' })
  @ApiResponse({ status: 400, description: 'Classification already exists' })
  createPartnerClassification(@Body() dto: CreatePartnerClassificationDto) {
    return this.partnersService.createPartnerClassification(dto);
  }

  @Get('lookup/classifications/:id')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get a single partner classification by ID' })
  @ApiResponse({ status: 200, description: 'Classification retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Classification not found' })
  getPartnerClassification(@Param('id') id: string) {
    return this.partnersService.getPartnerClassification(id);
  }

  @Patch('lookup/classifications/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update a partner classification' })
  @ApiResponse({ status: 200, description: 'Classification updated successfully' })
  @ApiResponse({ status: 404, description: 'Classification not found' })
  @ApiResponse({ status: 400, description: 'Name already taken' })
  updatePartnerClassification(@Param('id') id: string, @Body() dto: UpdatePartnerClassificationDto) {
    return this.partnersService.updatePartnerClassification(id, dto);
  }

  @Delete('lookup/classifications/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete a partner classification (soft delete)' })
  @ApiResponse({ status: 204, description: 'Classification deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete: classification is in use by active partners' })
  deletePartnerClassification(@Param('id') id: string) {
    return this.partnersService.deletePartnerClassification(id);
  }

  // ─── PARTNER STATUS (read-only) ──────────────────────────────

  @Get('lookup/statuses')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all partner statuses (lookup)' })
  getPartnerStatuses() {
    return this.partnersService.getPartnerStatuses();
  }

  @Get('code/:partnerId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get partner by PTR-YYYY-XXXX code' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  findByPartnerId(@Param('partnerId') partnerId: string): Promise<PartnerResponseDto> {
    return this.partnersService.findByPartnerId(partnerId);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get partner by UUID' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  findOne(@Param('id') id: string): Promise<PartnerResponseDto> {
    return this.partnersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update partner information' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerDto,
  ): Promise<PartnerResponseDto> {
    return this.partnersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiOperation({ summary: 'Soft delete a partner' })
  remove(@Param('id') id: string): Promise<void> {
    return this.partnersService.remove(id);
  }

  @Patch(':id/restore')
  @Roles('admin')
  @ApiOperation({ summary: 'Restore a soft-deleted partner' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  restore(@Param('id') id: string): Promise<PartnerResponseDto> {
    return this.partnersService.restore(id);
  }

  // ─── WORKFLOW ─────────────────────────────────────────────────

  @Patch(':id/review')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Knowledge & Ecosystem Director reviews the partner' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  review(
    @Param('id') id: string,
    @Body() dto: ReviewPartnerDto,
    @CurrentUser('id') userId: string,
  ): Promise<PartnerResponseDto> {
    return this.partnersService.review(id, dto, userId);
  }

  @Patch(':id/verify')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Director General verifies/approves the partner' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  verify(
    @Param('id') id: string,
    @Body() dto: ReviewPartnerDto,
    @CurrentUser('id') userId: string,
  ): Promise<PartnerResponseDto> {
    return this.partnersService.verify(id, dto, userId);
  }

  @Patch(':id/status')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update partner status (Active, Dormant, Expired, etc.)' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body('statusId') statusId: string,
  ): Promise<PartnerResponseDto> {
    return this.partnersService.updateStatus(id, statusId);
  }

  // ─── CONTACTS ─────────────────────────────────────────────────

  @Post(':id/contacts')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Add a contact to a partner' })
  @ApiResponse({ status: 201, type: PartnerResponseDto })
  addContact(
    @Param('id') partnerId: string,
    @Body() dto: CreateContactDto,
    @CurrentUser('id') userId: string,
  ): Promise<PartnerResponseDto> {
    return this.partnersService.addContact(partnerId, dto, userId);
  }

  @Patch('contacts/:contactId')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update a partner contact' })
  @ApiResponse({ status: 200, type: PartnerResponseDto })
  updateContact(
    @Param('contactId') contactId: string,
    @Body() dto: Partial<CreateContactDto>,
    @CurrentUser('id') userId: string,
  ): Promise<PartnerResponseDto> {
    return this.partnersService.updateContact(contactId, dto, userId);
  }

  @Delete('contacts/:contactId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Remove a partner contact' })
  removeContact(@Param('contactId') contactId: string): Promise<void> {
    return this.partnersService.removeContact(contactId);
  }

  // ─── FOCAL PERSONS ────────────────────────────────────────────

  @Post(':id/focal-persons')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Assign an internal focal person to a partner' })
  @ApiResponse({ status: 201, type: PartnerResponseDto })
  addFocalPerson(
    @Param('id') partnerId: string,
    @Body() dto: CreateFocalPersonDto,
  ): Promise<PartnerResponseDto> {
    return this.partnersService.addFocalPerson(partnerId, dto);
  }

  @Delete('focal-persons/:focalPersonId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Remove an internal focal person from a partner' })
  removeFocalPerson(@Param('focalPersonId') focalPersonId: string): Promise<void> {
    return this.partnersService.removeFocalPerson(focalPersonId);
  }
}
