import { Module } from '@nestjs/common';
import { PrioritiesService } from './priorities.service';
import { PrioritiesController } from './priorities.controller';

@Module({
  providers: [PrioritiesService],
  controllers: [PrioritiesController]
})
export class PrioritiesModule { }
