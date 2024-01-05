import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { OrderProductsService } from './orderProducts.service';
import { Prisma } from '@prisma/client';

@Controller('order-products')
export class OrderProductsController {
    constructor(private readonly orderProductsService: OrderProductsService) { }

    @Get()
    async findAll() {
        return this.orderProductsService.findAll();
    }

    @Get('orders/:orderUuid/products/:productUuid')
    async findOne(@Param('orderUuid') orderUuid: string, @Param('productUuid') productUuid: string) {
        return this.orderProductsService.findOne(orderUuid, productUuid);
    }

    @Post()
    async create(@Body() createOrderProductsDto: Prisma.OrderProductUncheckedCreateInput[]) {
        return this.orderProductsService.create(createOrderProductsDto);
    }

    @Put('orders/:orderUuid/products/:productUuid')
    async update(@Param('orderUuid') orderUuid: string, @Param('productUuid') productUuid: string, @Body() updateOrderProductsDto: Prisma.OrderProductUpdateInput) {
        return this.orderProductsService.update(orderUuid, productUuid, updateOrderProductsDto);
    }

    @Delete('orders/:orderUuid/products/:productUuid')
    async delete(@Param('orderUuid') orderUuid: string, @Param('productUuid') productUuid: string) {
        return this.orderProductsService.delete(orderUuid, productUuid);
    }

}
