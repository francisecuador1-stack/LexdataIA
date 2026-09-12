import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Fase2Service } from './fase2.service';

@Controller('fase-2')
export class Fase2Controller {
  constructor(private readonly service: Fase2Service) {}

  // ── Tratamientos (RAT) ──

  @Get('tratamientos')
  listTratamientos() {
    return this.service.listTratamientos();
  }

  @Post('tratamientos')
  createTratamiento(@Body() body: any) {
    return this.service.createTratamiento(body);
  }

  @Post('tratamientos/:id/validar')
  validarTratamiento(@Param('id') id: string) {
    return this.service.validarTratamiento(id);
  }

  // ── Activos ──

  @Get('activos')
  listActivos() {
    return this.service.listActivos();
  }

  @Post('activos')
  createActivo(@Body() body: any) {
    return this.service.createActivo(body);
  }

  // ── Riesgos ──

  @Get('riesgos')
  listRiesgos() {
    return this.service.listRiesgos();
  }

  @Get('riesgos/matriz')
  matrizRiesgos() {
    return this.service.matrizRiesgos();
  }

  @Get('riesgos/mapa-calor')
  mapaCalor() {
    return this.service.mapaCalor();
  }

  // ── EIPD ──

  @Get('eipd')
  listEipd() {
    return this.service.listEipd();
  }

  @Post('eipd')
  createEipd(@Body() body: any) {
    return this.service.createEipd(body);
  }

  // ── Reportes ──

  @Get('reportes/riesgos')
  reporteRiesgos() {
    return this.service.reporteRiesgos();
  }
}
