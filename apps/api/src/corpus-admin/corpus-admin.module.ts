import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CorpusAdminController } from './corpus-admin.controller';
import { CorpusAdminService } from './corpus-admin.service';
import { ExtractionService } from './extraction/extraction.service';
import { HybridSearchService } from './search/hybrid-search.service';

@Module({
  imports: [AuditModule],
  controllers: [CorpusAdminController],
  providers: [CorpusAdminService, ExtractionService, HybridSearchService],
  exports: [CorpusAdminService, ExtractionService, HybridSearchService],
})
export class CorpusAdminModule {}
