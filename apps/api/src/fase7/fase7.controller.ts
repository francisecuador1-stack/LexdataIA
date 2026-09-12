import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Fase7Service } from './fase7.service';

@Controller('fase-7')
export class Fase7Controller {
  constructor(private readonly service: Fase7Service) {}

  // ── Seguimiento ──

  @Get('seguimiento')
  getSeguimiento() {
    return this.service.getSeguimiento();
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

  // ── Madurez ──

  @Get('madurez')
  getMadurez() {
    return this.service.getMadurez();
  }

  // ── Lecciones aprendidas ──

  @Get('lecciones')
  listLecciones() {
    return this.service.listLecciones();
  }

  @Post('lecciones')
  createLeccion(@Body() body: any) {
    return this.service.createLeccion(body);
  }

  // ── Oportunidades de mejora ──

  @Get('oportunidades')
  listOportunidades() {
    return this.service.listOportunidades();
  }
}
