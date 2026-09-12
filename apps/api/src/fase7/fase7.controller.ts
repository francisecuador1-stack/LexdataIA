import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { Fase7Service } from './fase7.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('fase-7')
export class Fase7Controller {
  constructor(private readonly service: Fase7Service) {}

  // ── Recomendaciones ──

  @Get('recomendaciones')
  listRecomendaciones(@Req() req: any) {
    return this.service.listRecomendaciones(req.user.tenantId);
  }

  @Post('recomendaciones/:id/verificar')
  @Roles('DPO_HUMANO')
  verificarEficacia(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.verificarEficacia(
      req.user.tenantId,
      id,
      body.hashEvidencia,
      req.user.sub,
    );
  }

  // ── Madurez ──

  @Get('madurez')
  madurez(@Req() req: any) {
    return this.service.madurez(req.user.tenantId);
  }

  // ── Lecciones aprendidas ──

  @Get('lecciones')
  listLecciones(@Req() req: any) {
    return this.service.listLecciones(req.user.tenantId);
  }

  @Post('lecciones')
  createLeccion(@Req() req: any, @Body() body: any) {
    return this.service.createLeccion(req.user.tenantId, body);
  }

  // ── Oportunidades de mejora ──

  @Get('oportunidades')
  oportunidades(@Req() req: any) {
    return this.service.oportunidades(req.user.tenantId);
  }

  // ── Expediente de trazabilidad ──

  @Get('expediente/:recomendacionId')
  expediente(@Req() req: any, @Param('recomendacionId') recomendacionId: string) {
    return this.service.expediente(req.user.tenantId, recomendacionId);
  }
}
