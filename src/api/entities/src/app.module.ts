import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TeachersModule } from './teachers/teachers.module';
import { MarketsModule } from './markets/markets.module';
import { ShipModesModule } from './shipModes/shipModes.module';
import { PrioritiesModule } from './priorities/priorities.module';
import { SegmentsModule } from './segments/segments.module';
import { CategoriesModule } from './categories/categories.module';
import { CountriesModule } from './countries/countries.module';
import { StatesModule } from './states/states.module';

@Module({
  imports: [
    TeachersModule,
    MarketsModule,
    ShipModesModule,
    PrioritiesModule,
    SegmentsModule,
    CategoriesModule,
    CountriesModule,
    StatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
