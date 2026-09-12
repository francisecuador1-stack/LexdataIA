import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  // ── Usuarios del tenant ──

  @Get(':id/usuarios')
  listUsuarios(@Param('id') id: string) {
    return this.service.listUsuarios(id);
  }

  @Post(':id/usuarios')
  createUsuario(@Param('id') id: string, @Body() body: any) {
    return this.service.createUsuario(id, body);
  }
}
