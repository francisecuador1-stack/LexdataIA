import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { EvidenciasService } from './evidencias.service';

@Controller('evidencias')
export class EvidenciasController {
  constructor(private readonly service: EvidenciasService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  upload(@Body() body: any) {
    // TODO: handle file upload with SHA-256 hash
    return this.service.upload(body);
  }

  @Get(':id/verificar')
  verificar(@Param('id') id: string) {
    return this.service.verificar(id);
  }
}
