import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';
import { CorpusAdminService } from './corpus-admin.service';
import { ExtractionService } from './extraction/extraction.service';
import { HybridSearchService } from './search/hybrid-search.service';

/**
 * Corpus Admin endpoints — restricted to LEGAL_ADMIN and SUPERADMIN.
 * RN-004: all actions are audited. The corpus is global (not tenant-scoped).
 */
@Controller('corpus/admin')
@Roles('LEGAL_ADMIN', 'SUPERADMIN')
export class CorpusAdminController {
  constructor(
    private readonly service: CorpusAdminService,
    private readonly extraction: ExtractionService,
    private readonly search: HybridSearchService,
  ) {}

  // ─── Document CRUD ────────────────────────────────────────

  @Post('documentos')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: (parseInt(process.env['CORPUS_MAX_UPLOAD_MB'] ?? '50', 10)) * 1024 * 1024,
      files: 1,
    },
  }))
  async uploadDocumento(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: { fuente: string; tipo: string; organismoEmisor: string; fechaPublicacion?: string; registroOficial?: string },
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('Se requiere un archivo (campo "file")');
    if (!body.fuente || !body.tipo || !body.organismoEmisor) {
      throw new BadRequestException('Campos obligatorios: fuente, tipo, organismoEmisor');
    }

    return this.service.uploadDocumento({
      file: {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      fuente: body.fuente,
      tipo: body.tipo,
      organismoEmisor: body.organismoEmisor,
      fechaPublicacion: body.fechaPublicacion,
      registroOficial: body.registroOficial,
      userId: req.user.sub,
      tenantId: req.user.tenantId,
    });
  }

  @Get('documentos')
  async listDocumentos(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.service.listDocumentos({
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Get('documentos/:id')
  async getDocumento(@Param('id') id: string) {
    return this.service.getDocumento(id);
  }

  @Get('documentos/:id/archivo')
  async getArchivoUrl(@Param('id') id: string) {
    return this.service.getArchivoUrl(id);
  }

  @Delete('documentos/:id')
  async deleteDocumento(@Param('id') id: string, @Req() req: any) {
    return this.service.deleteDocumento(id, req.user.sub, req.user.tenantId);
  }

  // ─── Extraction ────────────────────────────────────────────

  @Post('documentos/:id/extraer')
  async extraerDocumento(
    @Param('id') id: string,
    @Body() body: { forzar?: boolean } | undefined,
    @Req() req: any,
  ) {
    return this.extraction.extraer(id, req.user.sub, req.user.tenantId, body?.forzar);
  }

  @Get('documentos/:id/articulos')
  async listArticulos(@Param('id') id: string) {
    return this.extraction.listArticulos(id);
  }

  @Patch('articulos/:id')
  async updateArticulo(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.extraction.updateArticulo(id, body, req.user.sub, req.user.tenantId);
  }

  @Post('articulos/:id/dividir')
  async dividirArticulo(@Param('id') id: string, @Req() req: any) {
    return this.extraction.dividirArticulo(id, req.user.sub, req.user.tenantId);
  }

  @Post('documentos/:id/publicar')
  async publicarDocumento(@Param('id') id: string, @Body() body: { motivoCambio: string }, @Req() req: any) {
    return this.extraction.publicar(id, body.motivoCambio, req.user.sub, req.user.tenantId);
  }

  // ─── Indexation ────────────────────────────────────────────

  @Post('indexar')
  @HttpCode(202)
  async indexar(@Body() body: { normaIds?: string[]; forzar?: boolean }) {
    return this.search.indexar(body.normaIds, body.forzar);
  }

  // ─── Index status ─────────────────────────────────────────

  @Get('indice/estado')
  async getIndiceEstado() {
    return this.service.getIndiceEstado();
  }

  // ─── Jobs ─────────────────────────────────────────────────

  @Get('jobs/:id')
  async getJob(@Param('id') id: string) {
    return this.service.getJob(id);
  }

  // ─── Export (placeholder — PR 5) ──────────────────────────

  @Post('exportar')
  async exportar(@Req() req: any) {
    // PR 5: regenerate YAML + corpus.lock.json from DB
    return { message: 'Exportación disponible en PR 5' };
  }
}
