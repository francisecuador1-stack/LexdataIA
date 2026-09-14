import { Module } from '@nestjs/common';
import { AgenteController } from './agente.controller';
import { AgenteService } from './agente.service';
import { CorpusRetriever } from './corpus-retriever';
import { CorpusModule } from '../corpus/corpus.module';

@Module({
  imports: [CorpusModule],
  controllers: [AgenteController],
  providers: [AgenteService, CorpusRetriever],
  exports: [AgenteService, CorpusRetriever],
})
export class AgenteModule {}
