import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { AgenteService } from './agente.service';

@Controller('agente')
export class AgenteController {
  constructor(private readonly service: AgenteService) {}

  @Post('chat')
  async chat(@Req() req: any, @Body() body: { conversacionId?: string; mensaje: string }) {
    return this.service.chat({
      conversacionId: body.conversacionId,
      mensaje: body.mensaje,
      tenantId: req.user.tenantId,
      userId: req.user.sub,
      rol: req.user.rol,
    });
  }

  @Get('conversaciones')
  listConversaciones(@Req() req: any) {
    return this.service.listConversaciones(req.user.tenantId, req.user.sub);
  }

  @Get('conversaciones/:id')
  getConversacion(@Req() req: any, @Param('id') id: string) {
    return this.service.getConversacion(id, req.user.tenantId);
  }

  @Get('actividad')
  getActividad(@Req() req: any) {
    return this.service.getActividad(req.user.tenantId);
  }

  @Get('bandeja')
  getBandeja(@Req() req: any) {
    return this.service.getBandeja(req.user.tenantId);
  }

  @Get('metricas')
  getMetricas(@Req() req: any) {
    return this.service.getMetricas(req.user.tenantId);
  }
}
