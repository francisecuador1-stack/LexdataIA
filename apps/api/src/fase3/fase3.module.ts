import { Module } from '@nestjs/common';
import { Fase3Controller } from './fase3.controller';
import { Fase3Service } from './fase3.service';

@Module({
  controllers: [Fase3Controller],
  providers: [Fase3Service],
  exports: [Fase3Service],
})
export class Fase3Module {}
