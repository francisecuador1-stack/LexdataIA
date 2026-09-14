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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';
import { CorpusAdminService } from './corpus-admin.service';

/**
 * Corpus Admin endpoints — restricted to LEGAL_ADMIN and SUPERADMIN.
 * RN-004: all actions are audited. The corpus is global (not tenant-scoped).
 */
@Controller('corpus/admin')
@Roles('LEGAL_ADMIN', 'SUPERADMIN')
export class CorpusAdminController {
  constructor(private readonly service: CorpusAdminService) {}

  // ─── Document CRUD ────────────────────────────────────────

  @Post('documentos')
  @UseInterceptors(FileInterceptor('file'))
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

  // ─── Extraction (placeholder — PR 3) ─────────────────────

  @Post('documentos/:id/extraer')
  async extraerDocumento(@Param('id') id: string, @Req() req: any) {
    // PR 3: enqueue extraction job
    return { message: 'Extracción disponible en PR 3', documentoId: id };
  }

  @Get('documentos/:id/articulos')
  async listArticulos(@Param('id') id: string) {
    // PR 3: return extracted articles
    return { message: 'Artículos extraídos disponibles en PR 3', documentoId: id };
  }

  @Patch('articulos/:id')
  async updateArticulo(@Param('id') id: string, @Body() body: any) {
    // PR 3: edit article fields, change status
    return { message: 'Edición de artículos disponible en PR 3', articuloId: id };
  }

  @Post('articulos/:id/dividir')
  async dividirArticulo(@Param('id') id: string) {
    // PR 3: split article
    return { message: 'División de artículos disponible en PR 3', articuloId: id };
  }

  @Post('documentos/:id/publicar')
  async publicarDocumento(@Param('id') id: string, @Body() body: { motivoCambio: string }, @Req() req: any) {
    // PR 3: publish approved articles as Norma + ControlNormativo
    return { message: 'Publicación disponible en PR 3', documentoId: id };
  }

  // ─── Indexation (placeholder — PR 4) ──────────────────────

  @Post('indexar')
  async indexar(@Body() body: { normaIds?: string[]; forzar?: boolean }, @Req() req: any) {
    // PR 4: enqueue chunking + embeddings
    return { message: 'Indexación disponible en PR 4' };
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
