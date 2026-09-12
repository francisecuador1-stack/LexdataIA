import { Controller, Get, Post, Patch, Param, Body, Req } from '@nestjs/common';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  @Get()
  list(@Req() req: any) { return this.service.list(req.user.tenantId); }

  @Get(':id')
  getById(@Req() req: any, @Param('id') id: string) { return this.service.getById(req.user.tenantId, id); }

  @Post()
  create(@Req() req: any, @Body() body: any) { return this.service.create(req.user.tenantId, body); }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.service.update(req.user.tenantId, id, body); }

  @Get(':id/resumen')
  getResumen(@Req() req: any, @Param('id') id: string) { return this.service.getResumen(req.user.tenantId, id); }

  @Get(':id/derivacion-documental')
  getDerivacionDocumental(@Req() req: any, @Param('id') id: string) { return this.service.getDerivacionDocumental(req.user.tenantId, id); }
}
