import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly service: PortalService) {}

  // ── PIMS ──

  @Get('pims')
  listPims(@Req() req: any) {
    return this.service.listPims(req.user.tenantId);
  }

  @Post('pims/responder')
  responderPims(@Req() req: any, @Body() body: any) {
    return this.service.responderPims(req.user.tenantId, body.preguntaId, body.respuesta);
  }

  // ── Registro (formulario SPDP + Pd-VaR) ──

  @Public()
  @Post('registro')
  crearRegistro(@Body() body: any) {
    return this.service.crearRegistro(body);
  }

  @Public()
  @Get('registro/:id/resultado')
  getResultadoRegistro(@Param('id') id: string) {
    return this.service.getResultadoRegistro(id);
  }
}
