// src/modules/partners/partners.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { ReviewPartnerDto } from './dto/review-partner.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { CreateFocalPersonDto } from './dto/create-focal-person.dto';
import { QueryPartnersDto } from './dto/query-partners.dto';
import { PartnerResponseDto } from './dto/partner-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePartnerDto, userId: string): Promise<PartnerResponseDto> {
    // Validate PATH A references if FORMAL
    if (dto.registrationPath === 'FORMAL') {
      if (!dto.agreementId) {
        throw new BadRequestException('agreementId is required for FORMAL registration path');
      }
      const agreement = await this.prisma.agreement.findUnique({
        where: { id: dto.agreementId, deletedAt: null },
      });
      if (!agreement) throw new NotFoundException('Agreement not found');
    }

    if (dto.opportunityId) {
      const opp = await this.prisma.partnerOpportunity.findUnique({
        where: { id: dto.opportunityId, deletedAt: null },
      });
      if (!opp) throw new NotFoundException('Opportunity not found');
    }

    if (dto.engagementId) {
      const eng = await this.prisma.engagement.findUnique({
        where: { id: dto.engagementId, deletedAt: null },
      });
      if (!eng) throw new NotFoundException('Engagement not found');
    }

    // Validate status
    const status = await this.prisma.partnerStatus.findUnique({
      where: { id: dto.statusId, deletedAt: null },
    });
    if (!status) throw new NotFoundException('Partner status not found');

    // Validate org type if provided
    if (dto.organizationTypeId) {
      const orgType = await this.prisma.organizationType.findUnique({
        where: { id: dto.organizationTypeId, deletedAt: null },
      });
      if (!orgType) throw new NotFoundException('Organization type not found');
    }

    // Validate classification if provided
    if (dto.partnerClassificationId) {
      const cls = await this.prisma.partnerClassification.findUnique({
        where: { id: dto.partnerClassificationId, deletedAt: null },
      });
      if (!cls) throw new NotFoundException('Partner classification not found');
    }

    // Generate unique partner ID: PTR-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await this.prisma.partner.count({
      where: { partnerId: { startsWith: `PTR-${year}` } },
    });
    const partnerId = `PTR-${year}-${String(count + 1).padStart(4, '0')}`;

    const partner = await this.prisma.partner.create({
      data: {
        partnerUid: crypto.randomUUID(),
        partnerId,
        registrationPath: dto.registrationPath,
        agreementId: dto.agreementId,
        opportunityId: dto.opportunityId,
        engagementId: dto.engagementId,
        partnerName: dto.partnerName,
        acronym: dto.acronym,
        organizationTypeId: dto.organizationTypeId,
        country: dto.country,
        regionState: dto.regionState,
        city: dto.city,
        address: dto.address,
        website: dto.website,
        yearEstablished: dto.yearEstablished,
        registrationLicenseNumber: dto.registrationLicenseNumber,
        taxNumber: dto.taxNumber,
        logoUrl: dto.logoUrl,
        mission: dto.mission,
        vision: dto.vision,
        strategicFocusAreas: dto.strategicFocusAreas,
        keyExpertiseAreas: dto.keyExpertiseAreas,
        aiFocusAreas: dto.aiFocusAreas,
        annualBudget: dto.annualBudget ? new Prisma.Decimal(dto.annualBudget) : null,
        numberOfEmployees: dto.numberOfEmployees,
        geographicCoverage: dto.geographicCoverage,
        partnerClassificationId: dto.partnerClassificationId,
        statusId: dto.statusId,
        createdById: userId,
        verifiedStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(partner);
  }

  async findAll(query: QueryPartnersDto): Promise<{
    data: PartnerResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      statusId,
      organizationTypeId,
      partnerClassificationId,
      country,
      registrationPath,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.PartnerWhereInput = { deletedAt: null };

    if (statusId) where.statusId = statusId;
    if (organizationTypeId) where.organizationTypeId = organizationTypeId;
    if (partnerClassificationId) where.partnerClassificationId = partnerClassificationId;
    if (country) where.country = { contains: country, mode: 'insensitive' };
    if (registrationPath) where.registrationPath = registrationPath;

    if (search) {
      where.OR = [
        { partnerName: { contains: search, mode: 'insensitive' } },
        { partnerId: { contains: search, mode: 'insensitive' } },
        { acronym: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, partners] = await Promise.all([
      this.prisma.partner.count({ where }),
      this.prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: this.getIncludeObject(),
      }),
    ]);

    return {
      data: partners.map((p) => this.mapToResponseDto(p)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeObject(),
    });
    if (!partner) throw new NotFoundException('Partner not found');
    return this.mapToResponseDto(partner);
  }

  async findByPartnerId(partnerId: string): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findUnique({
      where: { partnerId, deletedAt: null },
      include: this.getIncludeObject(),
    });
    if (!partner) throw new NotFoundException('Partner not found');
    return this.mapToResponseDto(partner);
  }

  async update(id: string, dto: UpdatePartnerDto): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findUnique({
      where: { id, deletedAt: null },
    });
    if (!partner) throw new NotFoundException('Partner not found');

    if (dto.statusId) {
      const status = await this.prisma.partnerStatus.findUnique({ where: { id: dto.statusId } });
      if (!status) throw new NotFoundException('Partner status not found');
    }

    const updated = await this.prisma.partner.update({
      where: { id },
      data: {
        ...dto,
        annualBudget: dto.annualBudget !== undefined
          ? (dto.annualBudget !== null ? new Prisma.Decimal(dto.annualBudget) : null)
          : undefined,
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });
    return this.mapToResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const partner = await this.prisma.partner.findUnique({ where: { id, deletedAt: null } });
    if (!partner) throw new NotFoundException('Partner not found');
    await this.prisma.partner.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
  }

  async restore(id: string): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!partner) throw new NotFoundException('Partner not found or not deleted');
    const restored = await this.prisma.partner.update({
      where: { id },
      data: { deletedAt: null, updatedAt: new Date() },
      include: this.getIncludeObject(),
    });
    return this.mapToResponseDto(restored);
  }

  // ─── WORKFLOW ────────────────────────────────────────────────

  async review(id: string, dto: ReviewPartnerDto, userId: string): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findUnique({ where: { id, deletedAt: null } });
    if (!partner) throw new NotFoundException('Partner not found');

    if (dto.status === 'Rejected' && !dto.note) {
      throw new BadRequestException('A review note is required when rejecting a partner');
    }

    const updated = await this.prisma.partner.update({
      where: { id },
      data: {
        reviewedById: userId,
        reviewNotes: dto.note || null,
        reviewDate: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });
    return this.mapToResponseDto(updated);
  }

  async verify(id: string, dto: ReviewPartnerDto, userId: string): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findUnique({ where: { id, deletedAt: null } });
    if (!partner) throw new NotFoundException('Partner not found');

    const isApproved = dto.status === 'Approved';
    const updated = await this.prisma.partner.update({
      where: { id },
      data: {
        verifiedById: userId,
        verificationNotes: dto.note || null,
        verificationDate: new Date(),
        verifiedStatus: isApproved ? 'approved' : 'rejected',
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });
    return this.mapToResponseDto(updated);
  }

  async updateStatus(id: string, statusId: string): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findUnique({ where: { id, deletedAt: null } });
    if (!partner) throw new NotFoundException('Partner not found');

    const status = await this.prisma.partnerStatus.findUnique({ where: { id: statusId } });
    if (!status) throw new NotFoundException('Partner status not found');

    const updated = await this.prisma.partner.update({
      where: { id },
      data: { statusId, updatedAt: new Date() },
      include: this.getIncludeObject(),
    });
    return this.mapToResponseDto(updated);
  }

  // ─── CONTACTS ────────────────────────────────────────────────

  async addContact(
    partnerId: string,
    dto: CreateContactDto,
    userId: string,
  ): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findUnique({ where: { id: partnerId, deletedAt: null } });
    if (!partner) throw new NotFoundException('Partner not found');

    // If setting as primary, unset existing primary
    if (dto.isPrimary) {
      await this.prisma.partnerContact.updateMany({
        where: { partnerId, isPrimary: true, deletedAt: null },
        data: { isPrimary: false },
      });
    }

    await this.prisma.partnerContact.create({
      data: {
        contactUid: crypto.randomUUID(),
        partnerId,
        fullName: dto.fullName,
        positionTitle: dto.positionTitle,
        department: dto.department,
        email: dto.email,
        mobilePhone: dto.mobilePhone,
        officePhone: dto.officePhone,
        isPrimary: dto.isPrimary ?? false,
        roleInPartnership: dto.roleInPartnership,
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(partnerId);
  }

  async updateContact(
    contactId: string,
    dto: Partial<CreateContactDto>,
    userId: string,
  ): Promise<PartnerResponseDto> {
    const contact = await this.prisma.partnerContact.findUnique({
      where: { id: contactId, deletedAt: null },
    });
    if (!contact) throw new NotFoundException('Contact not found');

    if (dto.isPrimary) {
      await this.prisma.partnerContact.updateMany({
        where: { partnerId: contact.partnerId, isPrimary: true, deletedAt: null, NOT: { id: contactId } },
        data: { isPrimary: false },
      });
    }

    await this.prisma.partnerContact.update({
      where: { id: contactId },
      data: { ...dto, updatedAt: new Date() },
    });

    return this.findOne(contact.partnerId);
  }

  async removeContact(contactId: string): Promise<void> {
    const contact = await this.prisma.partnerContact.findUnique({
      where: { id: contactId, deletedAt: null },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    await this.prisma.partnerContact.update({
      where: { id: contactId },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
  }

  // ─── FOCAL PERSONS ───────────────────────────────────────────

  async addFocalPerson(
    partnerId: string,
    dto: CreateFocalPersonDto,
  ): Promise<PartnerResponseDto> {
    const partner = await this.prisma.partner.findUnique({ where: { id: partnerId, deletedAt: null } });
    if (!partner) throw new NotFoundException('Partner not found');

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.internalFocalPerson.findUnique({
      where: {
        partnerId_userId: { partnerId, userId: dto.userId },
      },
    });
    if (existing && !existing.deletedAt) {
      throw new ConflictException('This user is already a focal person for this partner');
    }

    if (dto.isPrimary) {
      await this.prisma.internalFocalPerson.updateMany({
        where: { partnerId, isPrimary: true, deletedAt: null },
        data: { isPrimary: false },
      });
    }

    await this.prisma.internalFocalPerson.upsert({
      where: { partnerId_userId: { partnerId, userId: dto.userId } },
      update: {
        isPrimary: dto.isPrimary ?? false,
        position: dto.position ?? user.position,
        division: dto.division,
        directorate: dto.directorate,
        email: dto.email ?? user.email,
        phone: dto.phone,
        deletedAt: null,
        updatedAt: new Date(),
      },
      create: {
        partnerId,
        userId: dto.userId,
        isPrimary: dto.isPrimary ?? false,
        position: dto.position ?? user.position,
        division: dto.division,
        directorate: dto.directorate,
        email: dto.email ?? user.email,
        phone: dto.phone,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(partnerId);
  }

  async removeFocalPerson(focalPersonId: string): Promise<void> {
    const fp = await this.prisma.internalFocalPerson.findUnique({
      where: { id: focalPersonId, deletedAt: null },
    });
    if (!fp) throw new NotFoundException('Focal person not found');
    await this.prisma.internalFocalPerson.update({
      where: { id: focalPersonId },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
  }

  // ─── LOOKUP TABLES ───────────────────────────────────────────

  async getOrganizationTypes() {
    return this.prisma.organizationType.findMany({
      where: { deletedAt: null },
      orderBy: { typeName: 'asc' },
    });
  }

  async getPartnerClassifications() {
    return this.prisma.partnerClassification.findMany({
      where: { deletedAt: null },
      orderBy: { classificationName: 'asc' },
    });
  }

  async getPartnerStatuses() {
    return this.prisma.partnerStatus.findMany({
      where: { deletedAt: null },
      orderBy: { statusName: 'asc' },
    });
  }

  // ─── HELPERS ─────────────────────────────────────────────────

  private getIncludeObject() {
    return {
      organizationType: true,
      partnerClassification: true,
      status: true,
      createdBy: { select: { id: true, fullName: true, email: true, position: true } },
      reviewer: { select: { id: true, fullName: true, email: true } },
      verifier: { select: { id: true, fullName: true, email: true } },
      agreement: { select: { id: true, agreementId: true, agreementTitle: true } },
      opportunity: { select: { id: true, title: true } },
      engagement: { select: { id: true, recordId: true } },
      contacts: {
        where: { deletedAt: null },
        orderBy: { isPrimary: 'desc' as const },
      },
      focalPersons: {
        where: { deletedAt: null },
        include: {
          user: { select: { id: true, fullName: true, email: true, position: true } },
        },
        orderBy: { isPrimary: 'desc' as const },
      },
    };
  }

  private mapToResponseDto(partner: any): PartnerResponseDto {
    return {
      id: partner.id,
      partnerUid: partner.partnerUid,
      partnerId: partner.partnerId,
      registrationPath: partner.registrationPath,
      agreementId: partner.agreementId,
      opportunityId: partner.opportunityId,
      engagementId: partner.engagementId,
      partnerName: partner.partnerName,
      acronym: partner.acronym,
      organizationType: partner.organizationType,
      country: partner.country,
      regionState: partner.regionState,
      city: partner.city,
      address: partner.address,
      website: partner.website,
      yearEstablished: partner.yearEstablished,
      registrationLicenseNumber: partner.registrationLicenseNumber,
      taxNumber: partner.taxNumber,
      logoUrl: partner.logoUrl,
      mission: partner.mission,
      vision: partner.vision,
      strategicFocusAreas: partner.strategicFocusAreas,
      keyExpertiseAreas: partner.keyExpertiseAreas,
      aiFocusAreas: partner.aiFocusAreas,
      annualBudget: partner.annualBudget?.toString(),
      numberOfEmployees: partner.numberOfEmployees,
      geographicCoverage: partner.geographicCoverage,
      partnerClassification: partner.partnerClassification,
      status: partner.status,
      verifiedStatus: partner.verifiedStatus,
      createdBy: partner.createdBy,
      reviewer: partner.reviewer,
      reviewNotes: partner.reviewNotes,
      reviewDate: partner.reviewDate,
      verifier: partner.verifier,
      verificationNotes: partner.verificationNotes,
      verificationDate: partner.verificationDate,
      agreement: partner.agreement,
      opportunity: partner.opportunity,
      engagement: partner.engagement,
      contacts: partner.contacts,
      focalPersons: partner.focalPersons,
      createdAt: partner.createdAt,
      updatedAt: partner.updatedAt,
    };
  }
}
