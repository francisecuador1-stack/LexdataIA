import { Module } from '@nestjs/common';
import { CorpusController } from './corpus.controller';
import { CorpusService } from './corpus.service';
import { HybridSearchService } from '../corpus-admin/search/hybrid-search.service';

@Module({
  controllers: [CorpusController],
  providers: [CorpusService, HybridSearchService],
  exports: [CorpusService, HybridSearchService],
})
export class CorpusModule {}
