import { Module } from '@nestjs/common';
import { Fase4Controller } from './fase4.controller';
import { Fase4Service } from './fase4.service';

@Module({
  controllers: [Fase4Controller],
  providers: [Fase4Service],
  exports: [Fase4Service],
})
export class Fase4Module {}
