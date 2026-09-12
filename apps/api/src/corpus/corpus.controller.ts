import { Controller, Get, Param, Query } from '@nestjs/common';
import { CorpusService } from './corpus.service';

@Controller('corpus')
export class CorpusController {
  constructor(private readonly service: CorpusService) {}

  // ── Normas ──

  @Get('normas')
  listNormas() {
    return this.service.listNormas();
  }

  @Get('normas/busqueda')
  busquedaSemantica(@Query('q') q: string) {
    return this.service.busquedaSemantica(q);
  }

  @Get('normas/:id')
  findNorma(@Param('id') id: string) {
    return this.service.findNorma(id);
  }

  // ── Controles ──

  @Get('controles')
  listControles() {
    return this.service.listControles();
  }

  // ── Principios ──

  @Get('principios')
  listPrincipios() {
    return this.service.listPrincipios();
  }

  @Get('principios/:id')
  findPrincipio(@Param('id') id: string) {
    return this.service.findPrincipio(id);
  }

  // ── Matriz de 18 controles normativos ──

  @Get('matriz')
  getMatriz() {
    return this.service.getMatriz();
  }
}
