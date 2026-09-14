import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CorpusAdminController } from './corpus-admin.controller';
import { CorpusAdminService } from './corpus-admin.service';

@Module({
  imports: [AuditModule],
  controllers: [CorpusAdminController],
  providers: [CorpusAdminService],
  exports: [CorpusAdminService],
})
export class CorpusAdminModule {}
