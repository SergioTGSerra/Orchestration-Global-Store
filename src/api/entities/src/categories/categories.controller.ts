import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll() {
        return this.categoriesService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.categoriesService.findOne(uuid);
    }

    @Post()
    async create(@Body() data: { name: string; fatherCategory?: string }) {
        return this.categoriesService.create(data);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() data: { name?: string; fatherCategory?: string }) {
        return this.categoriesService.update(uuid, data);
    }

    @Delete(':uuid')
    async deleteTeacher(@Param('uuid') uuid: string) {
        return this.categoriesService.delete(uuid);
    }
}
