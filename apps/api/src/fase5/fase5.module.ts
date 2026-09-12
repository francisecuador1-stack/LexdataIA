import { Module } from '@nestjs/common';
import { Fase5Controller } from './fase5.controller';
import { Fase5Service } from './fase5.service';

@Module({
  controllers: [Fase5Controller],
  providers: [Fase5Service],
  exports: [Fase5Service],
})
export class Fase5Module {}
