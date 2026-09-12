import { Controller, Get, Post, Query, Param, Req } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get('logs')
  @Roles('DPO_HUMANO', 'AUDITOR_EXTERNO')
  async list(
    @Req() req: any,
    @Query('entidad') entidad?: string,
    @Query('actorId') actorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.service.list({
      tenantId: req.user.tenantId,
      entidad,
      actorId,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      cursor,
    });
  }

  @Post('verify-chain')
  @Roles('DPO_HUMANO', 'SUPERADMIN')
  async verifyChain(@Req() req: any) {
    return this.service.verifyChain(req.user.tenantId);
  }

  @Public()
  @Get('/verificar/:codigo')
  async verificarCodigo(@Param('codigo') codigo: string) {
    const result = await this.service.verificarCodigo(codigo);
    if (!result) return { valido: false, message: 'Código no encontrado' };
    return result;
  }
}
