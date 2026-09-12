import { Module } from '@nestjs/common';
import { Fase2Controller } from './fase2.controller';
import { Fase2Service } from './fase2.service';

@Module({
  controllers: [Fase2Controller],
  providers: [Fase2Service],
  exports: [Fase2Service],
})
export class Fase2Module {}
