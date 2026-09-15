import { Controller, Get, Post, Param, Body, Req, Query } from '@nestjs/common';
import { Fase2Service } from './fase2.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('fase-2')
export class Fase2Controller {
  constructor(private readonly service: Fase2Service) {}

  // ── Tratamientos (RAT) ──
  @Get('tratamientos')
  listTratamientos(@Req() req: any, @Query('clienteId') clienteId?: string) {
    return this.service.listTratamientos(req.user.tenantId, clienteId);
  }

  @Post('tratamientos')
  createTratamiento(@Req() req: any, @Body() body: any) { return this.service.createTratamiento(req.user.tenantId, body); }

  @Post('tratamientos/:id/resolucion')
  @Roles('DPO_HUMANO')
  resolucionTratamiento(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.resolucionTratamiento(req.user.tenantId, id, req.user.sub, body);
  }

  // ── Activos ──
  @Get('activos')
  listActivos(@Req() req: any, @Query('clienteId') clienteId?: string) {
    return this.service.listActivos(req.user.tenantId, clienteId);
  }

  @Post('activos')
  createActivo(@Req() req: any, @Body() body: any) { return this.service.createActivo(req.user.tenantId, body); }

  // ── Categorías ──
  @Get('categorias')
  listCategorias(@Req() req: any) { return this.service.listCategorias(req.user.tenantId); }

  // ── Riesgos ──
  @Get('riesgos')
  listRiesgos(@Req() req: any, @Query('clienteId') clienteId?: string) {
    return this.service.listRiesgos(req.user.tenantId, clienteId);
  }

  @Post('riesgos')
  createRiesgo(@Req() req: any, @Body() body: any) { return this.service.createRiesgo(req.user.tenantId, body); }

  @Post('riesgos/:id/revision-dpo')
  @Roles('DPO_HUMANO')
  revisionDpo(@Req() req: any, @Param('id') id: string) { return this.service.revisionDpo(req.user.tenantId, id, req.user.sub); }

  @Get('riesgos/indicador')
  indicadorRiesgo(@Req() req: any) { return this.service.indicadorRiesgo(req.user.tenantId); }

  @Get('mapa-calor')
  mapaCalor(@Req() req: any, @Query('clienteId') clienteId?: string) {
    return this.service.mapaCalor(req.user.tenantId, clienteId);
  }

  @Get('matriz-consolidada')
  matrizConsolidada(@Req() req: any, @Query('clienteId') clienteId?: string) {
    return this.service.matrizConsolidada(req.user.tenantId, clienteId);
  }

  @Get('brecha-controles')
  brechaControles(@Req() req: any) { return this.service.brechaControles(req.user.tenantId); }

  // ── EIPD ──
  @Get('eipd')
  listEipd(@Req() req: any, @Query('clienteId') clienteId?: string) {
    return this.service.listEipd(req.user.tenantId, clienteId);
  }

  @Post('eipd')
  createEipd(@Req() req: any, @Body() body: any) { return this.service.createEipd(req.user.tenantId, body); }

  // ── Reportes ──
  @Get('reporte-ejecutivo')
  reporteEjecutivo(@Req() req: any) { return this.service.reporteEjecutivo(req.user.tenantId); }
}
