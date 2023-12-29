import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { StatesService } from './states.service';
import { Prisma } from '@prisma/client';

@Controller('states')
export class StatesController {
    constructor(private readonly statesService: StatesService) { }

    @Get()
    async findAll() {
        return this.statesService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.statesService.findOne(uuid);
    }

    @Get(':uuid/customers')
    async findCustomers(@Param('uuid') uuid: string) {
        return this.statesService.findCustomers(uuid);
    }

    @Post()
    async create(@Body() createStatesDto: Prisma.StateCreateInput) {
        return this.statesService.create(createStatesDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateStatesDto: Prisma.StateUpdateInput) {
        return this.statesService.update(uuid, updateStatesDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.statesService.delete(uuid);
    }

}
