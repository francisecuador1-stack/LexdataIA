import { Controller, Get, Post, Param, Body, Req, Query } from '@nestjs/common';
import { Fase4Service } from './fase4.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('fase-4')
export class Fase4Controller {
  constructor(private readonly service: Fase4Service) {}

  // ── Controles ──

  @Get('controles')
  listControles(@Req() req: any) {
    return this.service.listControles(req.user.tenantId);
  }

  @Post('controles')
  createControl(@Req() req: any, @Body() body: any) {
    return this.service.createControl(req.user.tenantId, body);
  }

  @Post('controles/:id/calificar')
  @Roles('DPO_HUMANO')
  calificarControl(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.calificarControl(req.user.tenantId, id, {
      suficiencia: body.suficiencia,
      userId: req.user.sub,
    });
  }

  // ── Medidas ──

  @Get('medidas')
  listMedidas(@Req() req: any, @Query('tipo') tipo?: string) {
    return this.service.listMedidas(req.user.tenantId, tipo);
  }

  // ── Validacion de principios ──

  @Get('validacion-principios')
  listValidacionPrincipios(@Req() req: any) {
    return this.service.listValidacionPrincipios(req.user.tenantId);
  }

  @Post('validacion-principios')
  @Roles('DPO_HUMANO')
  validarPrincipio(@Req() req: any, @Body() body: any) {
    return this.service.validarPrincipio(
      req.user.tenantId,
      body.tratamientoId,
      body.veredicto,
      body.motivo ?? null,
      req.user.sub,
    );
  }

  // ── Hallazgos ──

  @Get('hallazgos')
  listHallazgos(@Req() req: any) {
    return this.service.listHallazgos(req.user.tenantId);
  }

  @Post('hallazgos')
  createHallazgo(@Req() req: any, @Body() body: any) {
    return this.service.createHallazgo(req.user.tenantId, body);
  }

  // ── Planes de Accion ──

  @Get('planes-accion')
  listPlanesAccion(@Req() req: any) {
    return this.service.listPlanesAccion(req.user.tenantId);
  }

  @Post('planes-accion')
  createPlanAccion(@Req() req: any, @Body() body: any) {
    return this.service.createPlanAccion(req.user.tenantId, body);
  }
}
