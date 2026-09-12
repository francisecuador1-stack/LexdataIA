import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  @Post('generar')
  generar(@Body() body: any) {
    // TODO: enqueue PDF generation job
    return this.service.generar(body);
  }

  @Get(':id')
  download(@Param('id') id: string) {
    return this.service.download(id);
  }
}
