import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Prisma } from '@prisma/client';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Get()
    async findAll() {
        return this.ordersService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.ordersService.findOne(uuid);
    }

    @Get(':uuid/products')
    async findProducts(@Param('uuid') uuid: string) {
        return this.ordersService.findOrderProducts(uuid);
    }

    @Post()
    async create(@Body() createOrdersDto: Prisma.OrderCreateInput) {
        return this.ordersService.create(createOrdersDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateOrdersDto: Prisma.OrderUpdateInput) {
        return this.ordersService.update(uuid, updateOrdersDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.ordersService.delete(uuid);
    }

}
