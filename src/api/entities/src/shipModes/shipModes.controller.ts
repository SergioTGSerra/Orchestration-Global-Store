import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ShipModesService } from './shipModes.service';
import { Prisma } from '@prisma/client';

@Controller('ship-modes')
export class ShipModesController {
    constructor(private readonly shipModesService: ShipModesService) { }

    @Get()
    async findAll() {
        return this.shipModesService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.shipModesService.findOne(uuid);
    }

    @Get(':uuid/orders')
    async findOrders(@Param('uuid') uuid: string) {
        return this.shipModesService.findOrders(uuid);
    }

    @Post()
    async create(@Body() createShipModeDto: Prisma.ShipModeCreateInput) {
        return this.shipModesService.create(createShipModeDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateShipModeDto: Prisma.ShipModeUpdateInput) {
        return this.shipModesService.update(uuid, updateShipModeDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.shipModesService.delete(uuid);
    }

}
