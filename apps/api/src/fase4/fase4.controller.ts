import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Fase4Service } from './fase4.service';

@Controller('fase-4')
export class Fase4Controller {
  constructor(private readonly service: Fase4Service) {}

  // ── Controles ──

  @Get('controles')
  listControles() {
    return this.service.listControles();
  }

  @Post('controles')
  createControl(@Body() body: any) {
    return this.service.createControl(body);
  }

  @Post('controles/:id/calificar')
  calificarControl(@Param('id') id: string, @Body() body: any) {
    return this.service.calificarControl(id, body);
  }

  // ── Medidas y Validacion ──

  @Get('medidas')
  listMedidas() {
    return this.service.listMedidas();
  }

  @Get('validacion-principios')
  validacionPrincipios() {
    return this.service.validacionPrincipios();
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

  // ── Planes de Accion ──

  @Get('planes-accion')
  listPlanesAccion() {
    return this.service.listPlanesAccion();
  }

  @Post('planes-accion')
  createPlanAccion(@Body() body: any) {
    return this.service.createPlanAccion(body);
  }
}
