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
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { OrderProductsModule } from './orderProducts/orderProducts.module';

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
    CustomersModule,
    ProductsModule,
    OrdersModule,
    OrderProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
