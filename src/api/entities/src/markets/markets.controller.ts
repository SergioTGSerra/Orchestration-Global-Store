import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MarketsService } from './markets.service';

@Controller('markets')
export class MarketsController {
    constructor(private readonly marketsService: MarketsService) {}

    @Get()
    async findAll() {
        return this.marketsService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.marketsService.findOne(uuid);
    }

    @Post()
    async create(@Body() data: { name: string; region: string }) {
        return this.marketsService.create(data);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() data: { name?: string; region?: string }) {
        return this.marketsService.update(uuid, data);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.marketsService.delete(uuid);
    }
}
