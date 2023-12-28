import { Module } from '@nestjs/common';
import { OrderProductsService } from './orderProducts.service';
import { OrderProductsController } from './orderProducts.controller';

@Module({
  providers: [OrderProductsService],
  controllers: [OrderProductsController]
})
export class OrderProductsModule { }
