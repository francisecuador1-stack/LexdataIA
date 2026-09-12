import { Controller, Get, Post, Param, Body, Req, Query } from '@nestjs/common';
import { Fase6Service } from './fase6.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('fase-6')
export class Fase6Controller {
  constructor(private readonly service: Fase6Service) {}

  // ── Monitoreo (vista consolidada) ──

  @Get('monitoreo')
  centroMonitoreo(@Req() req: any) {
    return this.service.centroMonitoreo(req.user.tenantId);
  }

  // ── Auditorias ──

  @Get('auditorias')
  listAuditorias(@Req() req: any) {
    return this.service.listAuditorias(req.user.tenantId);
  }

  @Post('auditorias')
  createAuditoria(@Req() req: any, @Body() body: any) {
    return this.service.createAuditoria(req.user.tenantId, body);
  }

  // ── Checklist ──

  @Get('checklist')
  listChecklist(@Req() req: any, @Query('perfil') perfil?: string) {
    return this.service.listChecklist(req.user.tenantId, perfil);
  }

  @Post('checklist/responder')
  responderChecklist(@Req() req: any, @Body() body: any) {
    return this.service.responderChecklist(
      req.user.tenantId,
      body.itemId,
      body.respuesta,
      body.auditoriaId,
    );
  }

  // ── Hallazgos ──

  @Get('hallazgos')
  listHallazgos(@Req() req: any) {
    return this.service.listHallazgos(req.user.tenantId);
  }

  @Post('hallazgos/:id/cerrar')
  @Roles('DPO_HUMANO')
  cerrarHallazgo(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.cerrarHallazgo(
      req.user.tenantId,
      id,
      body.hashEvidencia,
      req.user.sub,
    );
  }

  // ── Sugerir norma ──

  @Get('sugerir-norma')
  sugerirNorma(@Query('texto') texto: string) {
    return this.service.sugerirNorma(texto);
  }

  // ── Incidentes ──

  @Get('incidentes')
  listIncidentes(@Req() req: any) {
    return this.service.listIncidentes(req.user.tenantId);
  }

  @Post('incidentes')
  createIncidente(@Req() req: any, @Body() body: any) {
    return this.service.createIncidente(req.user.tenantId, body);
  }

  @Post('incidentes/:id/notificar-spdp')
  notificarSpdp(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.notificarSpdp(req.user.tenantId, id, body);
  }

  // ── ARCO ──

  @Get('arco')
  listArco(@Req() req: any) {
    return this.service.listArco(req.user.tenantId);
  }

  // ── Indicadores ──

  @Get('indicadores')
  indicadores(@Req() req: any) {
    return this.service.indicadores(req.user.tenantId);
  }
}
