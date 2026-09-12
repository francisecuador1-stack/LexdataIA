import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Fase3Service } from './fase3.service';

@Controller('fase-3')
export class Fase3Controller {
  constructor(private readonly service: Fase3Service) {}

  // ── Diagnostico ──

  @Get('diagnostico')
  getDiagnostico() {
    return this.service.getDiagnostico();
  }

  @Post('diagnostico/responder')
  responderDiagnostico(@Body() body: any) {
    return this.service.responderDiagnostico(body);
  }

  @Post('diagnostico/preguntas')
  agregarPreguntas(@Body() body: any) {
    return this.service.agregarPreguntas(body);
  }

  // ── Gobierno ──

  @Get('gobierno')
  getGobierno() {
    return this.service.getGobierno();
  }

  @Get('roles')
  getRoles() {
    return this.service.getRoles();
  }

  @Get('recursos')
  getRecursos() {
    return this.service.getRecursos();
  }

  @Get('brechas')
  getBrechas() {
    return this.service.getBrechas();
  }

  // ── Recomendaciones ──

  @Get('recomendaciones')
  listRecomendaciones() {
    return this.service.listRecomendaciones();
  }

  @Post('recomendaciones/:id/verificar')
  verificarRecomendacion(@Param('id') id: string) {
    return this.service.verificarRecomendacion(id);
  }

  // ── Informe ──

  @Get('informe')
  getInforme() {
    return this.service.getInforme();
  }
}
