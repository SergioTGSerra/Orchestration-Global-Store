import { Module } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';

@Module({
  providers: [SegmentsService],
  controllers: [SegmentsController]
})
export class SegmentsModule { }
