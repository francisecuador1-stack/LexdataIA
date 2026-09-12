import { Module } from '@nestjs/common';
import { Fase6Controller } from './fase6.controller';
import { Fase6Service } from './fase6.service';

@Module({
  controllers: [Fase6Controller],
  providers: [Fase6Service],
  exports: [Fase6Service],
})
export class Fase6Module {}
