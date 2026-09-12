import { Controller, Get, Post } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get('logs')
  getLogs() {
    return this.service.getLogs();
  }

  @Post('verify-chain')
  verifyChain() {
    return this.service.verifyChain();
  }
}
