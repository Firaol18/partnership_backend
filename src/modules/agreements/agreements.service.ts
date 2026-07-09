// src/modules/agreements/agreements.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
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
import { Prisma } from '@prisma/client';

@Injectable()
export class AgreementsService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateAgreementDto,
    userId: string,
  ): Promise<AgreementResponseDto> {
    const {
      opportunityId,
      engagementId,
      partnerId,
      agreementTitle,
      agreementTypeId,
      startDate,
      endDate,
      renewalDate,
      partnerName,
      eaiiResponsibleDivision,
      eaiiResponsibleDirectorate,
      signatories,
    } = dto;

    // Validate opportunity
    const opportunity = await this.prisma.partnerOpportunity.findUnique({
      where: { id: opportunityId, deletedAt: null },
    });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    // Validate engagement if provided
    if (engagementId) {
      const engagement = await this.prisma.engagement.findUnique({
        where: { id: engagementId, deletedAt: null },
      });
      if (!engagement) {
        throw new NotFoundException('Engagement not found');
      }
    }

    // Validate agreement type
    const agreementType = await this.prisma.agreementType.findUnique({
      where: { id: agreementTypeId, deletedAt: null },
    });
    if (!agreementType) {
      throw new NotFoundException('Agreement type not found');
    }

    // Generate unique agreement ID: AGR-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await this.prisma.agreement.count({
      where: {
        agreementId: { startsWith: `AGR-${year}` },
      },
    });
    const agreementId = `AGR-${year}-${String(count + 1).padStart(4, '0')}`;

    const agreement = await this.prisma.agreement.create({
      data: {
        agreementUid: crypto.randomUUID(),
        agreementId,
        opportunityId,
        engagementId,
        partnerId,
        agreementTitle,
        agreementTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        partnerName,
        eaiiResponsibleDivision,
        eaiiResponsibleDirectorate,
        signatories: signatories as unknown as Prisma.InputJsonValue,
        status: 'Draft',
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(agreement);
  }

  async findAll(query: QueryAgreementsDto): Promise<{
    data: AgreementResponseDto[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      agreementTypeId,
      opportunityId,
      engagementId,
      partnerId,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.AgreementWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (agreementTypeId) {
      where.agreementTypeId = agreementTypeId;
    }

    if (opportunityId) {
      where.opportunityId = opportunityId;
    }

    if (engagementId) {
      where.engagementId = engagementId;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    const dateFilter: Prisma.AgreementWhereInput['startDate'] = {};
    if (fromDate) {
      dateFilter.gte = new Date(fromDate);
    }
    if (toDate) {
      dateFilter.lte = new Date(toDate);
    }
    if (fromDate || toDate) {
      where.startDate = dateFilter;
    }

    if (search) {
      where.OR = [
        { agreementTitle: { contains: search, mode: 'insensitive' } },
        { agreementId: { contains: search, mode: 'insensitive' } },
        { partnerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.agreement.count({ where });

    const agreements = await this.prisma.agreement.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: this.getIncludeObject(),
    });

    const data = agreements.map((agreement) => this.mapToResponseDto(agreement));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    return this.mapToResponseDto(agreement);
  }

  async findByAgreementId(agreementId: string): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { agreementId, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    return this.mapToResponseDto(agreement);
  }

  async findByOpportunity(opportunityId: string): Promise<AgreementResponseDto[]> {
    const agreements = await this.prisma.agreement.findMany({
      where: { opportunityId, deletedAt: null },
      include: this.getIncludeObject(),
      orderBy: { createdAt: 'desc' },
    });

    return agreements.map((agreement) => this.mapToResponseDto(agreement));
  }

  async update(
    id: string,
    dto: UpdateAgreementDto,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Draft') {
      throw new BadRequestException('Agreement can only be updated in Draft status');
    }

    const {
      opportunityId,
      engagementId,
      agreementTypeId,
      startDate,
      endDate,
      renewalDate,
      signatories,
      ...rest
    } = dto;

    // Validate references if updated
    if (opportunityId) {
      const opportunity = await this.prisma.partnerOpportunity.findUnique({
        where: { id: opportunityId, deletedAt: null },
      });
      if (!opportunity) {
        throw new NotFoundException('Opportunity not found');
      }
    }

    if (engagementId) {
      const engagement = await this.prisma.engagement.findUnique({
        where: { id: engagementId, deletedAt: null },
      });
      if (!engagement) {
        throw new NotFoundException('Engagement not found');
      }
    }

    if (agreementTypeId) {
      const agreementType = await this.prisma.agreementType.findUnique({
        where: { id: agreementTypeId, deletedAt: null },
      });
      if (!agreementType) {
        throw new NotFoundException('Agreement type not found');
      }
    }

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        ...rest,
        ...(opportunityId && { opportunityId }),
        ...(engagementId !== undefined && { engagementId }),
        ...(agreementTypeId && { agreementTypeId }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(renewalDate !== undefined && { renewalDate: renewalDate ? new Date(renewalDate) : null }),
        ...(signatories && { signatories: signatories as unknown as Prisma.InputJsonValue }),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Draft') {
      throw new BadRequestException('Only draft agreements can be deleted');
    }

    await this.prisma.agreement.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async restore(id: string): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found or not deleted');
    }

    const restored = await this.prisma.agreement.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(restored);
  }

  // WORKFLOW ACTIONS

  async submitForLegalReview(
    id: string,
    userId: string,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Draft') {
      throw new BadRequestException('Agreement must be in Draft status to submit for legal review');
    }

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        status: 'Under Legal Review',
        legalReviewStatus: 'Pending',
        legalReviewNotes: null,
        legalReviewedById: null,
        legalReviewDate: null,
        legalApproved: false,
        approvalStatus: 'Draft',
        approvalNotes: null,
        approvedById: null,
        approvalDate: null,
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async legalReview(
    id: string,
    dto: LegalReviewAgreementDto,
    userId: string,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Under Legal Review') {
      throw new BadRequestException('Agreement must be in Under Legal Review status');
    }

    if (dto.status === 'Rejected' && !dto.note) {
      throw new BadRequestException('A review note is required when rejecting the legal review');
    }

    const isApproved = dto.status === 'Approved';
    const nextStatus = isApproved ? 'Under Review' : 'Draft';

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        status: nextStatus,
        legalReviewStatus: dto.status,
        legalReviewNotes: dto.note || null,
        legalReviewedById: userId,
        legalReviewDate: new Date(),
        legalApproved: isApproved,
        reviewHistory: {
          create: {
            reviewerId: userId,
            reviewType: 'Legal Review',
            reviewNotes: dto.note || 'Legal review processed.',
            reviewStatus: isApproved ? 'Approved' : 'Rejected',
            reviewDate: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async review(
    id: string,
    dto: ApproveAgreementDto, // Uses ApproveAgreementDto pattern for Division Review
    userId: string,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Under Review') {
      throw new BadRequestException('Agreement must be in Under Review status');
    }

    const isApproved = dto.status === 'Approved';

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        reviewedById: userId,
        reviewNotes: dto.note || null,
        reviewDate: new Date(),
        reviewHistory: {
          create: {
            reviewerId: userId,
            reviewType: 'Division Review',
            reviewNotes: dto.note || 'Division review completed.',
            reviewStatus: isApproved ? 'Approved' : 'Rejected',
            reviewDate: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async verify(
    id: string,
    dto: ApproveAgreementDto,
    userId: string,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Under Review') {
      throw new BadRequestException('Agreement must be in Under Review status');
    }

    const isApproved = dto.status === 'Approved';

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        verifiedById: userId,
        verificationNotes: dto.note || null,
        verificationDate: new Date(),
        verifiedStatus: isApproved ? 'approved' : 'rejected',
        reviewHistory: {
          create: {
            reviewerId: userId,
            reviewType: 'Technical Review',
            reviewNotes: dto.note || 'Technical review processed.',
            reviewStatus: isApproved ? 'Approved' : 'Rejected',
            reviewDate: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async approve(
    id: string,
    dto: ApproveAgreementDto,
    userId: string,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Under Review') {
      throw new BadRequestException('Agreement must be in Under Review status');
    }

    if (!agreement.legalApproved) {
      throw new BadRequestException('Agreement must be legally approved before director approval');
    }

    if (dto.status === 'Rejected' && !dto.note) {
      throw new BadRequestException('An approval note is required when rejecting the agreement');
    }

    const isApproved = dto.status === 'Approved';
    const nextStatus = isApproved ? 'Under Review' : 'Draft'; // If rejected, return to Draft

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        status: nextStatus,
        approvalStatus: isApproved ? 'Approved' : 'Rejected',
        approvalNotes: dto.note || null,
        approvedById: userId,
        approvalDate: new Date(),
        reviewHistory: {
          create: {
            reviewerId: userId,
            reviewType: 'DG Review',
            reviewNotes: dto.note || 'Director review completed.',
            reviewStatus: isApproved ? 'Approved' : 'Rejected',
            reviewDate: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async sign(
    id: string,
    dto: SignAgreementDto,
    userId: string,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Under Review') {
      throw new BadRequestException('Agreement must be in Under Review status to be signed');
    }

    if (agreement.approvalStatus !== 'Approved') {
      throw new BadRequestException('Agreement must be approved by the director before signing');
    }

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        status: 'Signed',
        signedVersionPath: dto.signedVersionPath,
        signingDate: new Date(dto.signingDate),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async activate(id: string): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Signed') {
      throw new BadRequestException('Agreement must be in Signed status to activate');
    }

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        status: 'Active',
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async expire(id: string): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Active') {
      throw new BadRequestException('Agreement must be in Active status to expire');
    }

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        status: 'Expired',
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async renew(
    id: string,
    dto: RenewAgreementDto,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    if (agreement.status !== 'Active' && agreement.status !== 'Expired') {
      throw new BadRequestException('Agreement must be Active or Expired to renew');
    }

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        status: 'Renewed',
        endDate: new Date(dto.endDate),
        ...(dto.renewalDate && { renewalDate: new Date(dto.renewalDate) }),
        amendments: {
          create: {
            amendmentUid: crypto.randomUUID(),
            amendmentTitle: 'Renewal Amendment',
            amendmentDescription: dto.note || 'Agreement renewed.',
            amendmentDate: new Date(),
            effectiveDate: new Date(),
            approvalStatus: 'Approved',
            approvedDate: new Date(),
            createdById: agreement.createdById,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async terminate(
    id: string,
    dto: TerminateAgreementDto,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    const terminatable = ['Signed', 'Active', 'Renewed'];
    if (!terminatable.includes(agreement.status)) {
      throw new BadRequestException(
        `Agreement must be in one of [${terminatable.join(', ')}] status to terminate`,
      );
    }

    const updated = await this.prisma.agreement.update({
      where: { id },
      data: {
        status: 'Terminated',
        terminationNote: dto.terminationNote || null,
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  // AMENDMENT ACTIONS

  async addAmendment(
    id: string,
    dto: CreateAmendmentDto,
    userId: string,
  ): Promise<AgreementResponseDto> {
    const agreement = await this.prisma.agreement.findUnique({
      where: { id, deletedAt: null },
    });

    if (!agreement) {
      throw new NotFoundException('Agreement not found');
    }

    const activeStates = ['Active', 'Renewed'];
    if (!activeStates.includes(agreement.status)) {
      throw new BadRequestException('Amendments can only be added to Active or Renewed agreements');
    }

    await this.prisma.agreementAmendment.create({
      data: {
        amendmentUid: crypto.randomUUID(),
        agreementId: id,
        amendmentTitle: dto.amendmentTitle,
        amendmentDescription: dto.amendmentDescription,
        amendmentDate: new Date(dto.amendmentDate),
        effectiveDate: new Date(dto.effectiveDate),
        changedClauses: dto.changedClauses !== undefined && dto.changedClauses !== null
          ? (dto.changedClauses as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        reasonForAmendment: dto.reasonForAmendment,
        documentId: dto.documentId,
        createdById: userId,
        approvalStatus: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(id);
  }

  async approveAmendment(
    amendmentId: string,
    dto: ApproveAgreementDto,
    userId: string,
  ): Promise<AgreementResponseDto> {
    const amendment = await this.prisma.agreementAmendment.findUnique({
      where: { id: amendmentId, deletedAt: null },
    });

    if (!amendment) {
      throw new NotFoundException('Amendment not found');
    }

    if (amendment.approvalStatus !== 'Pending') {
      throw new BadRequestException('Amendment is already processed');
    }

    const isApproved = dto.status === 'Approved';

    await this.prisma.agreementAmendment.update({
      where: { id: amendmentId },
      data: {
        approvalStatus: isApproved ? 'Approved' : 'Rejected',
        approvedById: userId,
        approvedDate: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(amendment.agreementId);
  }

  // HELPERS

  private getIncludeObject() {
    return {
      agreementType: true,
      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          position: true,
        },
      },
      legalReviewedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      verifier: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      opportunity: {
        select: {
          id: true,
          title: true,
          partnerName: true,
        },
      },
      engagement: {
        select: {
          id: true,
          recordId: true,
        },
      },
      documents: {
        where: { deletedAt: null },
      },
      amendments: {
        where: { deletedAt: null },
        include: {
          createdBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          approvedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
      reviewHistory: {
        include: {
          reviewer: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        orderBy: { reviewDate: 'desc' as const },
      },
    };
  }

  private mapToResponseDto(agreement: any): AgreementResponseDto {
    return {
      id: agreement.id,
      agreementUid: agreement.agreementUid,
      agreementId: agreement.agreementId,
      opportunityId: agreement.opportunityId,
      engagementId: agreement.engagementId,
      partnerId: agreement.partnerId,
      agreementTitle: agreement.agreementTitle,
      agreementType: agreement.agreementType,
      startDate: agreement.startDate.toISOString().split('T')[0],
      endDate: agreement.endDate.toISOString().split('T')[0],
      renewalDate: agreement.renewalDate
        ? agreement.renewalDate.toISOString().split('T')[0]
        : undefined,
      legalReviewStatus: agreement.legalReviewStatus,
      legalReviewNotes: agreement.legalReviewNotes,
      legalReviewDate: agreement.legalReviewDate,
      legalApproved: agreement.legalApproved,
      approvalStatus: agreement.approvalStatus,
      approvalNotes: agreement.approvalNotes,
      approvalDate: agreement.approvalDate,
      reviewNotes: agreement.reviewNotes,
      reviewDate: agreement.reviewDate,
      verificationNotes: agreement.verificationNotes,
      verificationDate: agreement.verificationDate,
      verifiedStatus: agreement.verifiedStatus,
      partnerName: agreement.partnerName,
      eaiiResponsibleDivision: agreement.eaiiResponsibleDivision,
      eaiiResponsibleDirectorate: agreement.eaiiResponsibleDirectorate,
      signatories: agreement.signatories as unknown as any[],
      signingDate: agreement.signingDate
        ? agreement.signingDate.toISOString().split('T')[0]
        : undefined,
      signedVersionPath: agreement.signedVersionPath,
      version: agreement.version,
      previousVersionId: agreement.previousVersionId,
      status: agreement.status,
      terminationNote: agreement.terminationNote,
      createdBy: agreement.createdBy,
      legalReviewedBy: agreement.legalReviewedBy,
      reviewer: agreement.reviewer,
      verifier: agreement.verifier,
      approver: agreement.approvedBy,
      documents: agreement.documents,
      amendments: agreement.amendments,
      reviewHistory: agreement.reviewHistory,
      opportunity: agreement.opportunity,
      engagement: agreement.engagement,
      createdAt: agreement.createdAt,
      updatedAt: agreement.updatedAt,
    };
  }
}
