import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AgenteService } from './agente.service';

@Controller('agente')
export class AgenteController {
  constructor(private readonly service: AgenteService) {}

  // ── Chat con MARK AI ──

  @Post('chat')
  chat(@Body() body: any) {
    return this.service.chat(body);
  }

  // ── Conversaciones ──

  @Get('conversaciones')
  listConversaciones() {
    return this.service.listConversaciones();
  }

  @Get('conversaciones/:id')
  getConversacion(@Param('id') id: string) {
    return this.service.getConversacion(id);
  }

  // ── Actividad (ticker feed) ──

  @Get('actividad')
  getActividad() {
    return this.service.getActividad();
  }
}
