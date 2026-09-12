import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { Fase5Service } from './fase5.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('fase-5')
export class Fase5Controller {
  constructor(private readonly service: Fase5Service) {}

  // ── Controles ──

  @Get('controles')
  listControles(@Req() req: any) {
    return this.service.listControles(req.user.tenantId);
  }

  @Post('controles/:id/evaluar-eficacia')
  @Roles('DPO_HUMANO')
  evaluarEficacia(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.evaluarEficacia(req.user.tenantId, id, body, req.user.sub);
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

  // ── Contadores badge ──

  @Get('badges')
  contadoresBadge(@Req() req: any) {
    return this.service.contadoresBadge(req.user.tenantId);
  }
}
