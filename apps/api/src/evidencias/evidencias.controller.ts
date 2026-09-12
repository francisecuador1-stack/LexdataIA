import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { EvidenciasService } from './evidencias.service';

@Controller('evidencias')
export class EvidenciasController {
  constructor(private readonly service: EvidenciasService) {}

  @Get()
  list(@Req() req: any) {
    return this.service.list(req.user.tenantId);
  }

  @Post()
  upload(@Req() req: any, @Body() body: any) {
    // TODO: handle file upload with SHA-256 hash
    return this.service.registrar(req.user.tenantId, body);
  }

  @Get(':id/verificar')
  verificar(@Req() req: any, @Param('id') id: string) {
    return this.service.verificar(req.user.tenantId, id);
  }
}
