import { Module } from '@nestjs/common';
import { Fase7Controller } from './fase7.controller';
import { Fase7Service } from './fase7.service';

@Module({
  controllers: [Fase7Controller],
  providers: [Fase7Service],
  exports: [Fase7Service],
})
export class Fase7Module {}
