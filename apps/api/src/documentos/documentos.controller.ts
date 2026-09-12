import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { DocumentosService } from './documentos.service';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Post(':id/aprobar')
  aprobar(@Param('id') id: string) {
    return this.service.aprobar(id);
  }

  @Post(':id/firmar')
  firmar(@Param('id') id: string, @Body() body: any) {
    return this.service.firmar(id, body);
  }

  @Get('solicitudes-firma')
  listSolicitudesFirma() {
    return this.service.listSolicitudesFirma();
  }
}
