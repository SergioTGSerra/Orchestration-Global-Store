import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Prisma } from '@prisma/client';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    async findAll() {
        return this.customersService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.customersService.findOne(uuid);
    }

    @Post()
    async create(@Body() createCustomerDto: Prisma.CustomerCreateInput) {
        return this.customersService.create(createCustomerDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateCustomerDto: Prisma.CustomerUpdateInput) {
        return this.customersService.update(uuid, updateCustomerDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.customersService.delete(uuid);
    }

}
