import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEventDto,
  CreateParticipantDto,
  CreateBudgetDto,
} from './dto/create-event.dto';
import { CreateOutcomeDto } from './dto/create-outcome.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<EventResponseDto> {
    const {
      title,
      eventName,
      eventTypeId,
      eventCategoryId,
      eventDate,
      startTime,
      endTime,
      venue,
      organizer,
      coOrganizer,
      eventModeId,
      partnerId,
      status,
      participants = [],
      eaiiParticipants = [],
      budget,
    } = createEventDto;

    // Generate record ID: EVT-YYYY-XXXX
    const year = new Date().getFullYear();
    const count = await this.prisma.event.count({
      where: {
        recordId: { startsWith: `EVT-${year}` },
      },
    });
    const recordId = `EVT-${year}-${String(count + 1).padStart(4, '0')}`;

    // Validate references
    await this.validateReferences(
      eventTypeId,
      eventCategoryId,
      eventModeId,
      partnerId,
    );

    // Validate participants
    for (const participant of participants) {
      if (participant.email) {
        const existing = await this.prisma.eventParticipant.findFirst({
          where: {
            email: participant.email,
            event: {
              eventDate: {
                equals: new Date(eventDate),
              },
            },
          },
        });
        if (existing) {
          throw new ConflictException(
            `Participant with email ${participant.email} already registered for this date`,
          );
        }
      }
    }

    // Validate EAII participants
    if (eaiiParticipants.length > 0) {
      const userIds = eaiiParticipants.map((p) => p.userId).filter((id): id is string => Boolean(id));
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
      });
      if (users.length !== userIds.length) {
        throw new BadRequestException(
          'One or more EAII participants not found',
        );
      }
    }

    const event = await this.prisma.event.create({
      data: {
        eventUid: crypto.randomUUID(),
        recordId,
        title,
        eventName,
        eventTypeId,
        eventCategoryId,
        eventDate: new Date(eventDate),
        startTime: new Date(`1970-01-01T${startTime}`),
        endTime: new Date(`1970-01-01T${endTime}`),
        venue,
        organizer,
        coOrganizer,
        eventModeId,
        partnerId: partnerId || null,
        status: status || 'Planned',
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        participants: {
          create: participants
            .filter((p) => p.fullName && p.email)
            .map((p) => ({
              participantUid: crypto.randomUUID(),
              fullName: p.fullName,
              organizationName: p.organizationName,
              position: p.position,
              email: p.email,
              phoneNumber: p.phoneNumber,
              participantType: p.participantType || 'Regular',
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
        },
        eaiiParticipants: {
          create: eaiiParticipants
            .filter((p) => p.userId)
            .map((p) => ({
              userId: p.userId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
        },
        budgets: budget
          ? {
              create: {
                budgetUid: crypto.randomUUID(),
                estimatedBudget: budget.estimatedBudget
                  ? new Prisma.Decimal(budget.estimatedBudget)
                  : null,
                actualBudget: budget.actualBudget
                  ? new Prisma.Decimal(budget.actualBudget)
                  : null,
                fundingSource: budget.fundingSource,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }
          : undefined,
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(event);
  }

  async findAll(query: QueryEventsDto): Promise<{
    data: EventResponseDto[];
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
      eventTypeId,
      eventCategoryId,
      partnerId,
      fromDate,
      toDate,
      sortBy = 'eventDate',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = limit;

    // Build where clause
    const where: Prisma.EventWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (eventTypeId) {
      where.eventTypeId = eventTypeId;
    }

    if (eventCategoryId) {
      where.eventCategoryId = eventCategoryId;
    }

    if (partnerId) {
      where.partnerId = partnerId;
    }

    if (fromDate) {
      where.eventDate = { gte: new Date(fromDate) };
    }

    if (toDate) {
      where.eventDate = { lte: new Date(toDate) };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { eventName: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { recordId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.event.count({ where });

    // Get events with pagination
    const events = await this.prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: this.getIncludeObject(),
    });

    const data = events.map((event) => this.mapToResponseDto(event));

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

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.mapToResponseDto(event);
  }

  async findByRecordId(recordId: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { recordId, deletedAt: null },
      include: this.getIncludeObject(),
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.mapToResponseDto(event);
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const {
      title,
      eventName,
      eventTypeId,
      eventCategoryId,
      eventDate,
      startTime,
      endTime,
      venue,
      organizer,
      coOrganizer,
      eventModeId,
      partnerId,
      status,
    } = updateEventDto;

    // Validate references if provided
    if (eventTypeId || eventCategoryId || eventModeId || partnerId) {
      await this.validateReferences(
        eventTypeId,
        eventCategoryId,
        eventModeId,
        partnerId,
      );
    }

    const updateData: Prisma.EventUpdateInput = {
      title,
      eventName,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      startTime: startTime ? new Date(`1970-01-01T${startTime}`) : undefined,
      endTime: endTime ? new Date(`1970-01-01T${endTime}`) : undefined,
      venue,
      organizer,
      coOrganizer,
      status,
      updatedAt: new Date(),
    };

    if (eventTypeId) {
      updateData.eventType = { connect: { id: eventTypeId } };
    }
    if (eventCategoryId) {
      updateData.eventCategory = { connect: { id: eventCategoryId } };
    }
    if (eventModeId) {
      updateData.eventMode = { connect: { id: eventModeId } };
    }
    if (partnerId !== undefined) {
      updateData.partnerId = partnerId || null;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const event = await this.prisma.event.update({
      where: { id },
      data: updateData,
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
        status: 'Cancelled',
      },
    });
  }

  async restore(id: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.deletedAt) {
      throw new BadRequestException('Event is not deleted');
    }

    const restored = await this.prisma.event.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(restored);
  }

  async addParticipant(
    eventId: string,
    participantData: CreateParticipantDto,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check for duplicate email
    const existing = await this.prisma.eventParticipant.findFirst({
      where: {
        eventId,
        email: participantData.email,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Participant with this email already registered',
      );
    }

    await this.prisma.eventParticipant.create({
      data: {
        participantUid: crypto.randomUUID(),
        eventId,
        fullName: participantData.fullName,
        organizationName: participantData.organizationName,
        position: participantData.position,
        email: participantData.email,
        phoneNumber: participantData.phoneNumber,
        participantType: participantData.participantType || 'Regular',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(eventId);
  }

  async removeParticipant(
    eventId: string,
    participantId: string,
  ): Promise<EventResponseDto> {
    const participant = await this.prisma.eventParticipant.findFirst({
      where: {
        id: participantId,
        eventId,
        deletedAt: null,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    await this.prisma.eventParticipant.update({
      where: { id: participantId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(eventId);
  }

  async addEaiiParticipant(
    eventId: string,
    userId: string,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.eventEaiiParticipant.findFirst({
      where: {
        eventId,
        userId,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('User already registered for this event');
    }

    await this.prisma.eventEaiiParticipant.create({
      data: {
        eventId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(eventId);
  }

  async removeEaiiParticipant(
    eventId: string,
    userId: string,
  ): Promise<EventResponseDto> {
    const participant = await this.prisma.eventEaiiParticipant.findFirst({
      where: {
        eventId,
        userId,
        deletedAt: null,
      },
    });

    if (!participant) {
      throw new NotFoundException('EAII participant not found');
    }

    await this.prisma.eventEaiiParticipant.update({
      where: { id: participant.id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(eventId);
  }

  async updateBudget(
    eventId: string,
    budgetData: CreateBudgetDto,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const existingBudget = await this.prisma.eventBudget.findFirst({
      where: { eventId, deletedAt: null },
    });

    if (existingBudget) {
      await this.prisma.eventBudget.update({
        where: { id: existingBudget.id },
        data: {
          estimatedBudget: budgetData.estimatedBudget
            ? new Prisma.Decimal(budgetData.estimatedBudget)
            : null,
          actualBudget: budgetData.actualBudget
            ? new Prisma.Decimal(budgetData.actualBudget)
            : null,
          fundingSource: budgetData.fundingSource,
          updatedAt: new Date(),
        },
      });
    } else {
      await this.prisma.eventBudget.create({
        data: {
          budgetUid: crypto.randomUUID(),
          eventId,
          estimatedBudget: budgetData.estimatedBudget
            ? new Prisma.Decimal(budgetData.estimatedBudget)
            : null,
          actualBudget: budgetData.actualBudget
            ? new Prisma.Decimal(budgetData.actualBudget)
            : null,
          fundingSource: budgetData.fundingSource,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return this.findOne(eventId);
  }

  async createOutcome(
    eventId: string,
    data: CreateOutcomeDto,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.eventOutcome.create({
      data: {
        outcomeUid: crypto.randomUUID(),
        eventId,
        keyDiscussions: data.keyDiscussions,
        agreementsReached: data.agreementsReached,
        actionPoints: data.actionPoints,
        objectivesAchieved: data.objectivesAchieved,
        recommendations: data.recommendations,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return this.findOne(eventId);
  }

  async findOutcomes(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.prisma.eventOutcome.findMany({
      where: { eventId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOutcome(
    eventId: string,
    outcomeId: string,
    data: CreateOutcomeDto,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const outcome = await this.prisma.eventOutcome.findFirst({
      where: { id: outcomeId, eventId, deletedAt: null },
    });

    if (!outcome) {
      throw new NotFoundException('Outcome not found');
    }

    await this.prisma.eventOutcome.update({
      where: { id: outcome.id },
      data: {
        keyDiscussions: data.keyDiscussions,
        agreementsReached: data.agreementsReached,
        actionPoints: data.actionPoints,
        objectivesAchieved: data.objectivesAchieved,
        recommendations: data.recommendations,
        updatedAt: new Date(),
      },
    });

    return this.findOne(eventId);
  }

  async removeOutcome(
    eventId: string,
    outcomeId: string,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const outcome = await this.prisma.eventOutcome.findFirst({
      where: { id: outcomeId, eventId, deletedAt: null },
    });

    if (!outcome) {
      throw new NotFoundException('Outcome not found');
    }

    await this.prisma.eventOutcome.update({
      where: { id: outcome.id },
      data: { deletedAt: new Date() },
    });

    return this.findOne(eventId);
  }

  async verifyEvent(
    id: string,
    verifiedBy: string,
    notes?: string,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        verifiedBy,
        verificationNotes: notes,
        verificationDate: new Date(),
        verifiedStatus: 'verified',
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  async reviewEvent(
    id: string,
    reviewedBy: string,
    notes?: string,
  ): Promise<EventResponseDto> {
    const event = await this.prisma.event.findUnique({
      where: { id, deletedAt: null },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        reviewedBy,
        reviewNotes: notes,
        reviewDate: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    return this.mapToResponseDto(updated);
  }

  private async validateReferences(
    eventTypeId?: string,
    eventCategoryId?: string,
    eventModeId?: string,
    partnerId?: string,
  ): Promise<void> {
    if (eventTypeId) {
      const type = await this.prisma.eventType.findUnique({
        where: { id: eventTypeId },
      });
      if (!type) {
        throw new BadRequestException('Event type not found');
      }
    }

    if (eventCategoryId) {
      const category = await this.prisma.eventCategory.findUnique({
        where: { id: eventCategoryId },
      });
      if (!category) {
        throw new BadRequestException('Event category not found');
      }
    }

    if (eventModeId) {
      const mode = await this.prisma.eventMode.findUnique({
        where: { id: eventModeId },
      });
      if (!mode) {
        throw new BadRequestException('Event mode not found');
      }
    }

    // Commented out until Partner model is added
    // if (partnerId) {
    //   const partner = await this.prisma.partner.findUnique({
    //     where: { id: partnerId },
    //   });
    //   if (!partner) {
    //     throw new BadRequestException('Partner not found');
    //   }
    // }
  }

  private getIncludeObject() {
    return {
      eventType: true,
      eventCategory: true,
      eventMode: true,
      creator: {
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
      participants: {
        where: { deletedAt: null },
      },
      eaiiParticipants: {
        where: { deletedAt: null },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              position: true,
            },
          },
        },
      },
      budgets: {
        where: { deletedAt: null },
      },
      outcomes: {
        where: { deletedAt: null },
      },
    };
  }

  private mapToResponseDto(event: any): EventResponseDto {
    return {
      id: event.id,
      eventUid: event.eventUid,
      recordId: event.recordId,
      title: event.title,
      eventName: event.eventName,
      eventType: event.eventType,
      eventCategory: event.eventCategory,
      eventDate: event.eventDate.toISOString().split('T')[0],
      startTime: event.startTime.toTimeString().split(' ')[0],
      endTime: event.endTime.toTimeString().split(' ')[0],
      venue: event.venue,
      organizer: event.organizer,
      coOrganizer: event.coOrganizer,
      eventMode: event.eventMode,
      partnerId: event.partnerId,
      status: event.status,
      verifiedStatus: event.verifiedStatus,
      reviewNotes: event.reviewNotes,
      verificationNotes: event.verificationNotes,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      participants: event.participants,
      eaiiParticipants: event.eaiiParticipants,
      budget: event.budgets?.[0],
      outcomes: event.outcomes,
      createdBy: event.creator,
    };
  }
}
