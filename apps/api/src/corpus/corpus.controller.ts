import { Controller, Get, Post, Delete, Patch, Param, Query, Body, Req, ForbiddenException } from '@nestjs/common';
import { CorpusService } from './corpus.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('corpus')
export class CorpusController {
  constructor(private readonly service: CorpusService) {}

  @Get('normas')
  listNormas(
    @Query('tipo') tipo?: string, @Query('fuente') fuente?: string,
    @Query('fase') fasePHVA?: string, @Query('categoria') categoria?: string,
    @Query('estado') estado?: string, @Query('q') q?: string,
    @Query('limit') limit?: string, @Query('cursor') cursor?: string,
  ) {
    return this.service.listNormas({ tipo, fuente, fasePHVA, categoria, estado, q, limit: limit ? parseInt(limit) : undefined, cursor });
  }

  @Get('normas/stats')
  getStats() { return this.service.getStats(); }

  @Get('normas/:codigo')
  getNorma(@Param('codigo') codigo: string) { return this.service.getNormaByCodigo(codigo); }

  @Get('matriz')
  getMatriz(@Query('fase') fasePHVA?: string) { return this.service.getMatriz(fasePHVA); }

  @Get('principios')
  listPrincipios() { return this.service.listPrincipios(); }

  @Get('principios/:id')
  getPrincipio(@Param('id') id: string) { return this.service.getPrincipio(id); }

  @Patch('principios/:id/estado')
  @Roles('DPO_HUMANO')
  actualizarEstadoPrincipio(
    @Req() req: any, @Param('id') id: string,
    @Body() body: { estado: string; hashEvidencia?: string },
  ) {
    return this.service.actualizarEstadoPrincipio(req.user.tenantId, id, body.estado, req.user.sub, body.hashEvidencia);
  }

  @Post('normas/:id/favorita')
  toggleFavorita(@Req() req: any, @Param('id') normaId: string) {
    return this.service.toggleFavorita(req.user.tenantId, req.user.sub, normaId);
  }

  @Post('normas/:id/vista')
  registrarVista(@Req() req: any, @Param('id') normaId: string) {
    return this.service.registrarVista(req.user.tenantId, req.user.sub, normaId);
  }

  @Get('buscar')
  buscar(@Query('q') q: string) { return this.service.buscar(q); }

  // Block writes for non-LEGAL_ADMIN (RN-004)
  @Patch('normas/:id')
  @Roles('LEGAL_ADMIN')
  updateNorma() { throw new ForbiddenException('Solo LEGAL_ADMIN puede modificar normas'); }
}
