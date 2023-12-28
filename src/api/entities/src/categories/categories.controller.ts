import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Prisma } from '@prisma/client';

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
    async create(@Body() createCategoryDto: Prisma.CategoryCreateInput) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateCategoryDto: Prisma.CategoryUpdateInput) {
        return this.categoriesService.update(uuid, updateCategoryDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.categoriesService.delete(uuid);
    }
}
