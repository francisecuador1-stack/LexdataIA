import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CapacitacionesService } from './capacitaciones.service';

@Controller('capacitaciones')
export class CapacitacionesController {
  constructor(private readonly service: CapacitacionesService) {}

  // ── Cursos ──

  @Get('cursos')
  listCursos() {
    return this.service.listCursos();
  }

  @Get('cursos/:id')
  findCurso(@Param('id') id: string) {
    return this.service.findCurso(id);
  }

  // ── Evaluaciones ──

  @Post('evaluaciones')
  createEvaluacion(@Body() body: any) {
    return this.service.createEvaluacion(body);
  }

  @Get('evaluaciones')
  listEvaluaciones() {
    return this.service.listEvaluaciones();
  }

  // ── Certificados ──

  @Get('certificados/:id')
  getCertificado(@Param('id') id: string) {
    return this.service.getCertificado(id);
  }

  // ── Central (estadisticas) ──

  @Get('central')
  getCentral() {
    return this.service.getCentral();
  }

  // ── Informe ──

  @Get('informe')
  getInforme() {
    return this.service.getInforme();
  }
}
