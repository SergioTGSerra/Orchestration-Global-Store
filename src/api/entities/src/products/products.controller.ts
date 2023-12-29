import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Prisma } from '@prisma/client';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async findAll() {
        return this.productsService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.productsService.findOne(uuid);
    }

    @Get(':uuid/orders')
    async findOrders(@Param('uuid') uuid: string) {
        return this.productsService.findOrders(uuid);
    }

    @Post()
    async create(@Body() createProductsDto: Prisma.ProductCreateInput) {
        return this.productsService.create(createProductsDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateProductsDto: Prisma.ProductUpdateInput) {
        return this.productsService.update(uuid, updateProductsDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.productsService.delete(uuid);
    }

}
