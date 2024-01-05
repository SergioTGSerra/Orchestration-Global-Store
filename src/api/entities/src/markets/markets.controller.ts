import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { Prisma } from '@prisma/client';

@Controller('markets')
export class MarketsController {
    constructor(private readonly marketsService: MarketsService) { }

    @Get()
    async findAll() {
        return this.marketsService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.marketsService.findOne(uuid);
    }

    @Get(':uuid/orders')
    async findOrders(@Param('uuid') uuid: string) {
        return this.marketsService.findOrders(uuid);
    }

    @Post()
    async create(@Body() createMarketDto: Prisma.MarketCreateInput[]) {
        return this.marketsService.create(createMarketDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateMarketDto: Prisma.MarketUpdateInput) {
        return this.marketsService.update(uuid, updateMarketDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.marketsService.delete(uuid);
    }
}
