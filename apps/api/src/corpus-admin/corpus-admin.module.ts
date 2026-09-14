import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CorpusAdminController } from './corpus-admin.controller';
import { CorpusAdminService } from './corpus-admin.service';
import { ExtractionService } from './extraction/extraction.service';

@Module({
  imports: [AuditModule],
  controllers: [CorpusAdminController],
  providers: [CorpusAdminService, ExtractionService],
  exports: [CorpusAdminService, ExtractionService],
})
export class CorpusAdminModule {}
