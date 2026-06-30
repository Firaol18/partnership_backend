// src/modules/documents/documents.controller.ts
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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { QueryDocumentsDto } from './dto/query-documents.dto';
import { DocumentResponseDto, DocumentTypeDto } from './dto/document-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Register a new document / upload metadata' })
  @ApiResponse({ status: 201, type: DocumentResponseDto })
  create(
    @Body() dto: CreateDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.create(dto, userId);
  }

  @Get()
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all documents with pagination and filters' })
  findAll(@Query() query: QueryDocumentsDto) {
    return this.documentsService.findAll(query);
  }

  @Get('lookup/types')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get all document types (lookup)' })
  @ApiResponse({ status: 200, type: [DocumentTypeDto] })
  getTypes(): Promise<DocumentTypeDto[]> {
    return this.documentsService.getTypes();
  }

  @Get(':id')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Get a document by UUID' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  findOne(@Param('id') id: string): Promise<DocumentResponseDto> {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.update(id, dto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Soft delete a document' })
  remove(@Param('id') id: string): Promise<void> {
    return this.documentsService.remove(id);
  }

  @Post(':id/versions')
  @Roles('admin', 'manager', 'officer')
  @ApiOperation({ summary: 'Upload a new version of the document' })
  @ApiResponse({ status: 201, type: DocumentResponseDto })
  createNewVersion(
    @Param('id') id: string,
    @Body() dto: CreateDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.createNewVersion(id, dto, userId);
  }

  @Patch(':id/download')
  @Roles('admin', 'manager', 'officer', 'user')
  @ApiOperation({ summary: 'Increment download counter for a document' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  incrementDownloadCount(@Param('id') id: string): Promise<DocumentResponseDto> {
    return this.documentsService.incrementDownloadCount(id);
  }
}
