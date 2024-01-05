import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

    @Get(':uuid/products')
    async findProducts(@Param('uuid') uuid: string) {
        return this.categoriesService.findProducts(uuid);
    }

    @Post()
    async create(@Body() createCategoryDto: CreateCategoryDto[]) {
        return this.categoriesService.create(createCategoryDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoriesService.update(uuid, updateCategoryDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.categoriesService.delete(uuid);
    }
}
