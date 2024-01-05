import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PrioritiesService } from './priorities.service';
import { Prisma } from '@prisma/client';

@Controller('priorities')
export class PrioritiesController {
    constructor(private readonly prioritiesService: PrioritiesService) { }

    @Get()
    async findAll() {
        return this.prioritiesService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.prioritiesService.findOne(uuid);
    }

    @Get(':uuid/orders')
    async findOrders(@Param('uuid') uuid: string) {
        return this.prioritiesService.findOrders(uuid);
    }

    @Post()
    async create(@Body() createPriorityDto: Prisma.PriorityCreateInput[]) {
        return this.prioritiesService.create(createPriorityDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updatePriorityDto: Prisma.PriorityUpdateInput) {
        return this.prioritiesService.update(uuid, updatePriorityDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.prioritiesService.delete(uuid);
    }

}
