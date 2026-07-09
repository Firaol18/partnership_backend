// src/modules/agreements/agreements.controller.ts
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
import { AgreementsService } from './agreements.service';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { UpdateAgreementDto } from './dto/update-agreement.dto';
import { LegalReviewAgreementDto } from './dto/legal-review-agreement.dto';
import { ApproveAgreementDto } from './dto/approve-agreement.dto';
import { SignAgreementDto } from './dto/sign-agreement.dto';
import { RenewAgreementDto } from './dto/renew-agreement.dto';
import { TerminateAgreementDto } from './dto/terminate-agreement.dto';
import { CreateAmendmentDto } from './dto/create-amendment.dto';
import { QueryAgreementsDto } from './dto/query-agreements.dto';
import { AgreementResponseDto } from './dto/agreement-response.dto';
import { CreateAgreementTypeDto } from './dto/create-agreement-type.dto';
import { UpdateAgreementTypeDto } from './dto/update-agreement-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Agreements')
@ApiBearerAuth()
@Controller('agreements')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Post()
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Create a new partnership agreement (DRAFT)' })
  @ApiResponse({
    status: 201,
    description: 'Agreement created successfully',
    type: AgreementResponseDto,
  })
  async create(
    @Body() createAgreementDto: CreateAgreementDto,
    @CurrentUser('id') userId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.create(createAgreementDto, userId);
  }

  @Get()
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all agreements with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Agreements retrieved successfully',
  })
  async findAll(@Query() query: QueryAgreementsDto) {
    return this.agreementsService.findAll(query);
  }

  // ─── AGREEMENT TYPE MANAGEMENT ───────────────────────────────

  @Get('lookup/types')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all agreement types' })
  @ApiResponse({ status: 200, description: 'Agreement types retrieved successfully' })
  async getAgreementTypes() {
    return this.agreementsService.getAgreementTypes();
  }

  @Post('lookup/types')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new agreement type' })
  @ApiResponse({ status: 201, description: 'Agreement type created successfully' })
  @ApiResponse({ status: 400, description: 'Agreement type already exists' })
  async createAgreementType(@Body() dto: CreateAgreementTypeDto) {
    return this.agreementsService.createAgreementType(dto);
  }

  @Get('lookup/types/:id')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get a single agreement type by ID' })
  @ApiResponse({ status: 200, description: 'Agreement type retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Agreement type not found' })
  async getAgreementType(@Param('id') id: string) {
    return this.agreementsService.getAgreementType(id);
  }

  @Patch('lookup/types/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update an agreement type' })
  @ApiResponse({ status: 200, description: 'Agreement type updated successfully' })
  @ApiResponse({ status: 404, description: 'Agreement type not found' })
  @ApiResponse({ status: 400, description: 'Agreement type name already taken' })
  async updateAgreementType(
    @Param('id') id: string,
    @Body() dto: UpdateAgreementTypeDto,
  ) {
    return this.agreementsService.updateAgreementType(id, dto);
  }

  @Delete('lookup/types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete an agreement type (soft delete)' })
  @ApiResponse({ status: 204, description: 'Agreement type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Agreement type not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete: type is in use by active agreements' })
  async deleteAgreementType(@Param('id') id: string) {
    return this.agreementsService.deleteAgreementType(id);
  }

  // ─────────────────────────────────────────────────────────────

  @Get(':id')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get agreement by ID' })
  @ApiResponse({
    status: 200,
    description: 'Agreement retrieved successfully',
    type: AgreementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agreement not found' })
  async findOne(@Param('id') id: string): Promise<AgreementResponseDto> {
    return this.agreementsService.findOne(id);
  }

  @Get('code/:agreementId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get agreement by AGR-YYYY-XXXX code' })
  @ApiResponse({
    status: 200,
    description: 'Agreement retrieved successfully',
    type: AgreementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agreement not found' })
  async findByAgreementId(
    @Param('agreementId') agreementId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.findByAgreementId(agreementId);
  }

  @Get('opportunity/:opportunityId')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all agreements for an opportunity' })
  @ApiResponse({
    status: 200,
    description: 'Agreements retrieved successfully',
    type: [AgreementResponseDto],
  })
  async findByOpportunity(
    @Param('opportunityId') opportunityId: string,
  ): Promise<AgreementResponseDto[]> {
    return this.agreementsService.findByOpportunity(opportunityId);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update agreement (Draft only)' })
  @ApiResponse({
    status: 200,
    description: 'Agreement updated successfully',
    type: AgreementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agreement not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAgreementDto: UpdateAgreementDto,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.update(id, updateAgreementDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  @ApiOperation({ summary: 'Soft delete agreement' })
  @ApiResponse({ status: 204, description: 'Agreement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Agreement not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.agreementsService.remove(id);
  }

  @Patch(':id/restore')
  @Roles('admin')
  @ApiOperation({ summary: 'Restore deleted agreement' })
  @ApiResponse({
    status: 200,
    description: 'Agreement restored successfully',
    type: AgreementResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agreement not found' })
  async restore(@Param('id') id: string): Promise<AgreementResponseDto> {
    return this.agreementsService.restore(id);
  }

  // WORKFLOW ACTIONS

  @Patch(':id/submit')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Submit agreement for legal review (Draft → Under Legal Review)' })
  @ApiResponse({
    status: 200,
    description: 'Agreement submitted successfully',
    type: AgreementResponseDto,
  })
  async submitForLegalReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.submitForLegalReview(id, userId);
  }

  @Patch(':id/legal-review')
  @Roles('admin', 'manager') // Typically legal officers or managers
  @ApiOperation({ summary: 'Legal review decision (Approved → Under Review; Rejected → Draft)' })
  @ApiResponse({
    status: 200,
    description: 'Legal review processed successfully',
    type: AgreementResponseDto,
  })
  async legalReview(
    @Param('id') id: string,
    @Body() dto: LegalReviewAgreementDto,
    @CurrentUser('id') userId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.legalReview(id, dto, userId);
  }

  @Patch(':id/review')
  @Roles('admin', 'manager') // Division director
  @ApiOperation({ summary: 'Division Director review' })
  @ApiResponse({
    status: 200,
    description: 'Division review recorded',
    type: AgreementResponseDto,
  })
  async review(
    @Param('id') id: string,
    @Body() dto: ApproveAgreementDto,
    @CurrentUser('id') userId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.review(id, dto, userId);
  }

  @Patch(':id/verify')
  @Roles('admin', 'manager') // KE Director
  @ApiOperation({ summary: 'Knowledge & Ecosystem Director verification' })
  @ApiResponse({
    status: 200,
    description: 'Verification recorded',
    type: AgreementResponseDto,
  })
  async verify(
    @Param('id') id: string,
    @Body() dto: ApproveAgreementDto,
    @CurrentUser('id') userId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.verify(id, dto, userId);
  }

  @Patch(':id/approve')
  @Roles('admin', 'manager') // Director General (final approval)
  @ApiOperation({ summary: 'Final Director approval' })
  @ApiResponse({
    status: 200,
    description: 'Approval status recorded',
    type: AgreementResponseDto,
  })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveAgreementDto,
    @CurrentUser('id') userId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.approve(id, dto, userId);
  }

  @Patch(':id/sign')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Upload signed agreement document → Signed status' })
  @ApiResponse({
    status: 200,
    description: 'Agreement signed successfully',
    type: AgreementResponseDto,
  })
  async sign(
    @Param('id') id: string,
    @Body() dto: SignAgreementDto,
    @CurrentUser('id') userId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.sign(id, dto, userId);
  }

  @Patch(':id/activate')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Activate a signed agreement → Active status' })
  @ApiResponse({
    status: 200,
    description: 'Agreement activated successfully',
    type: AgreementResponseDto,
  })
  async activate(@Param('id') id: string): Promise<AgreementResponseDto> {
    return this.agreementsService.activate(id);
  }

  @Patch(':id/expire')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Expire an active agreement → Expired status' })
  @ApiResponse({
    status: 200,
    description: 'Agreement expired successfully',
    type: AgreementResponseDto,
  })
  async expire(@Param('id') id: string): Promise<AgreementResponseDto> {
    return this.agreementsService.expire(id);
  }

  @Patch(':id/renew')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Renew an Active/Expired agreement → Renewed status' })
  @ApiResponse({
    status: 200,
    description: 'Agreement renewed successfully',
    type: AgreementResponseDto,
  })
  async renew(
    @Param('id') id: string,
    @Body() dto: RenewAgreementDto,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.renew(id, dto);
  }

  @Patch(':id/terminate')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Terminate an agreement → Terminated status' })
  @ApiResponse({
    status: 200,
    description: 'Agreement terminated successfully',
    type: AgreementResponseDto,
  })
  async terminate(
    @Param('id') id: string,
    @Body() dto: TerminateAgreementDto,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.terminate(id, dto);
  }

  // AMENDMENT ACTIONS

  @Post(':id/amendments')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Add a new amendment to an Active/Renewed agreement' })
  @ApiResponse({
    status: 201,
    description: 'Amendment added successfully',
    type: AgreementResponseDto,
  })
  async addAmendment(
    @Param('id') id: string,
    @Body() dto: CreateAmendmentDto,
    @CurrentUser('id') userId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.addAmendment(id, dto, userId);
  }

  @Patch('amendments/:amendmentId/approve')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Approve or reject a pending amendment' })
  @ApiResponse({
    status: 200,
    description: 'Amendment status updated successfully',
    type: AgreementResponseDto,
  })
  async approveAmendment(
    @Param('amendmentId') amendmentId: string,
    @Body() dto: ApproveAgreementDto,
    @CurrentUser('id') userId: string,
  ): Promise<AgreementResponseDto> {
    return this.agreementsService.approveAmendment(amendmentId, dto, userId);
  }
}
