import { Module } from '@nestjs/common';
import { ShipModesService } from './shipModes.service';
import { ShipModesController } from './shipModes.controller';

@Module({
  providers: [ShipModesService],
  controllers: [ShipModesController]
})
export class ShipModesModule {}
