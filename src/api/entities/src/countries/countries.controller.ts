import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) { }

    @Get()
    async findAll() {
        return this.countriesService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.countriesService.findOne(uuid);
    }

    @Post()
    async create(@Body() data: { name: string }) {
        return this.countriesService.create(data);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() data: { name?: string }) {
        return this.countriesService.update(uuid, data);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.countriesService.delete(uuid);
    }
}
