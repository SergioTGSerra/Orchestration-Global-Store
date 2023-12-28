import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PrioritiesService } from './priorities.service';

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

    @Post()
    async create(@Body() data: { name: string }) {
        return this.prioritiesService.create(data);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() data: { name?: string }) {
        return this.prioritiesService.update(uuid, data);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.prioritiesService.delete(uuid);
    }

}
