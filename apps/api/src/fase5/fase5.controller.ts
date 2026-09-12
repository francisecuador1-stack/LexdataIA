import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Fase5Service } from './fase5.service';

@Controller('fase-5')
export class Fase5Controller {
  constructor(private readonly service: Fase5Service) {}

  // ── Controles ──

  @Get('controles')
  listControles() {
    return this.service.listControles();
  }

  @Post('controles/:id/evaluar-eficacia')
  evaluarEficacia(@Param('id') id: string, @Body() body: any) {
    return this.service.evaluarEficacia(id, body);
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

  // ── Recomendaciones ──

  @Get('recomendaciones')
  listRecomendaciones() {
    return this.service.listRecomendaciones();
  }
}
