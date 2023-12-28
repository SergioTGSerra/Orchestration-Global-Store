import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ShipModesService } from './shipModes.service';

@Controller('shipModes')
export class ShipModesController {
    constructor(private readonly shipModesService: ShipModesService) {}

    @Get()
    async findAll() {
        return this.shipModesService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.shipModesService.findOne(uuid);
    }

    @Post()
    async create(@Body() data: { name: string }) {
        return this.shipModesService.create(data);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() data: { name?: string }) {
        return this.shipModesService.update(uuid, data);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.shipModesService.delete(uuid);
    }

}
