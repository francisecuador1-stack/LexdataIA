import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
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
  createEvaluacion(@Req() req: any, @Body() body: any) {
    return this.service.evaluar(req.user.tenantId, body.cursoId, body.respuestas, body.personaNombre);
  }

  @Get('evaluaciones')
  listEvaluaciones(@Req() req: any) {
    return this.service.listEvaluaciones(req.user.tenantId);
  }

  // ── Certificados ──

  @Get('certificados/:id')
  getCertificado(@Param('id') id: string) {
    return this.service.getCertificado(id);
  }

  // ── Central (estadisticas) ──

  @Get('central')
  getCentral(@Req() req: any) {
    return this.service.getCentral(req.user.tenantId);
  }
}
