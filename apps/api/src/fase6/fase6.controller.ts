import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Fase6Service } from './fase6.service';

@Controller('fase-6')
export class Fase6Controller {
  constructor(private readonly service: Fase6Service) {}

  // ── Monitoreo (vista consolidada) ──

  @Get('monitoreo')
  getMonitoreo() {
    return this.service.getMonitoreo();
  }

  // ── Auditorias ──

  @Get('auditorias')
  listAuditorias() {
    return this.service.listAuditorias();
  }

  @Post('auditorias')
  createAuditoria(@Body() body: any) {
    return this.service.createAuditoria(body);
  }

  // ── Checklist ──

  @Get('checklist')
  getChecklist() {
    return this.service.getChecklist();
  }

  @Post('checklist/responder')
  responderChecklist(@Body() body: any) {
    return this.service.responderChecklist(body);
  }

  // ── Hallazgos ──

  @Get('hallazgos')
  listHallazgos() {
    return this.service.listHallazgos();
  }

  @Post('hallazgos')
  createHallazgo(@Body() body: any) {
    return this.service.createHallazgo(body);
  }

  @Post('hallazgos/:id/cerrar')
  cerrarHallazgo(@Param('id') id: string) {
    return this.service.cerrarHallazgo(id);
  }

  // ── Incidentes ──

  @Get('incidentes')
  listIncidentes() {
    return this.service.listIncidentes();
  }

  @Post('incidentes')
  createIncidente(@Body() body: any) {
    return this.service.createIncidente(body);
  }

  // ── Indicadores ──

  @Get('indicadores')
  getIndicadores() {
    return this.service.getIndicadores();
  }

  // ── Reportes ──

  @Get('reportes')
  getReportes() {
    return this.service.getReportes();
  }
}
