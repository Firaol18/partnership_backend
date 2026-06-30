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

  @Get('lookup/organization-types')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all organization types (lookup)' })
  getOrganizationTypes() {
    return this.partnersService.getOrganizationTypes();
  }

  @Get('lookup/classifications')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all partner classifications (lookup)' })
  getPartnerClassifications() {
    return this.partnersService.getPartnerClassifications();
  }

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
