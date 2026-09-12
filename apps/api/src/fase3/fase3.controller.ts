import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { Fase3Service } from './fase3.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('fase-3')
export class Fase3Controller {
  constructor(private readonly service: Fase3Service) {}

  // ── Diagnostico ──

  @Get('diagnostico')
  listDiagnostico(@Req() req: any) {
    return this.service.listDiagnostico(req.user.tenantId);
  }

  @Post('diagnostico/responder')
  responderDiagnostico(@Req() req: any, @Body() body: any) {
    return this.service.responderDiagnostico(
      req.user.tenantId,
      body.preguntaId,
      body.respuesta,
      req.user.sub,
    );
  }

  @Post('diagnostico/preguntas')
  @Roles('DPO_HUMANO')
  addPregunta(@Req() req: any, @Body() body: any) {
    return this.service.addPregunta(
      req.user.tenantId,
      body.dimensionId,
      body.enunciado,
      body.baseNormativa,
    );
  }

  // ── Gobierno ──

  @Get('gobierno')
  listGobierno(@Req() req: any) {
    return this.service.listGobierno(req.user.tenantId);
  }

  @Get('roles')
  listRoles(@Req() req: any) {
    return this.service.listRoles(req.user.tenantId);
  }

  @Get('recursos')
  listRecursos(@Req() req: any) {
    return this.service.listRecursos(req.user.tenantId);
  }

  @Get('brechas')
  listBrechas(@Req() req: any) {
    return this.service.listBrechas(req.user.tenantId);
  }

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

  // ── Informe ──

  @Get('informe')
  informeEjecutivo(@Req() req: any) {
    return this.service.informeEjecutivo(req.user.tenantId);
  }
}
