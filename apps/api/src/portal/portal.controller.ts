import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly service: PortalService) {}

  // ── PIMS ──

  @Get('pims')
  listPims() {
    return this.service.listPims();
  }

  @Post('pims/responder')
  responderPims(@Body() body: any) {
    return this.service.responderPims(body);
  }

  // ── Registro (formulario SPDP + Pd-VaR) ──

  @Post('registro')
  crearRegistro(@Body() body: any) {
    return this.service.crearRegistro(body);
  }

  @Get('registro/:id/resultado')
  getResultadoRegistro(@Param('id') id: string) {
    return this.service.getResultadoRegistro(id);
  }
}
