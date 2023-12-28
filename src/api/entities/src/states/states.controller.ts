import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { StatesService } from './states.service';

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

    @Post()
    async create(@Body() data: { name: string; }) {
        return this.statesService.create(data);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() data: { name?: string }) {
        return this.statesService.update(uuid, data);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.statesService.delete(uuid);
    }

}
