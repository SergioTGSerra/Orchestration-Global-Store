import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { Prisma } from '@prisma/client';

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

    @Get(':uuid/customers')
    async findCustomers(@Param('uuid') uuid: string) {
        return this.countriesService.findCustomers(uuid);
    }

    @Post()
    async create(@Body() createCountryDto: Prisma.CountryCreateInput[]) {
        return this.countriesService.create(createCountryDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateCountryDto: Prisma.CountryUpdateInput) {
        return this.countriesService.update(uuid, updateCountryDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.countriesService.delete(uuid);
    }
}
