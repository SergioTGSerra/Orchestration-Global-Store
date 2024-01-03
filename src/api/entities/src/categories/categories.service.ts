import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    private prisma = new PrismaClient();


    async findAll(): Promise<any[]> {
        const categories = await this.prisma.category.findMany();
        if (categories.length === 0) {
            throw new NotFoundException('Categories not found');
        }
        return categories;
    }

    async findOne(uuid: string): Promise<any> {
        const category = await this.prisma.category.findUnique({
            where: { uuid: uuid },
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async findProducts(uuid: string): Promise<any> {
        const category = await this.prisma.category.findUnique({
            where: { uuid: uuid },
            select: { Products: true },
        });
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        if (category.Products.length === 0) {
            throw new NotFoundException('This category has no products');
        }
        return category.Products;
    }

    async create(createCategoryDto: CreateCategoryDto): Promise<any> {
        const existingName = await this.prisma.category.findUnique({
            where: { name: createCategoryDto.name },
        });
        if (existingName) {
            throw new HttpException('Category name already exists', HttpStatus.BAD_REQUEST);
        }
        const existingParentCategory = await this.prisma.category.findUnique({
            where: { uuid: createCategoryDto.father_category },
        });
        if (!existingParentCategory) {
            throw new HttpException('Parent category not found', HttpStatus.NOT_FOUND);
        }
        return this.prisma.category.create({
            data: createCategoryDto,
        });
    }

    async update(uuid: string, updateCategoryDto: UpdateCategoryDto): Promise<any> {
        const existingCategory = await this.prisma.category.findUnique({
            where: { uuid: uuid },
        });
        if (!existingCategory) {
            throw new HttpException(`Category not found`, HttpStatus.NOT_FOUND);
        }
        if (updateCategoryDto.name && updateCategoryDto.name !== existingCategory.name) {
            const existingName = await this.prisma.category.findFirst({
                where: {
                    name: updateCategoryDto.name,
                    uuid: { not: uuid },
                },
            });
            if (existingName) {
                throw new HttpException('Category name already exists', HttpStatus.BAD_REQUEST);
            }
            const existingParentCategory = await this.prisma.category.findUnique({
                where: { uuid: updateCategoryDto.father_category as string },
            });
            if (!existingParentCategory) {
                throw new HttpException('Parent category not found', HttpStatus.NOT_FOUND);
            }
        }
        return this.prisma.category.update({
            where: { uuid: uuid },
            data: updateCategoryDto,
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingCategory = await this.prisma.category.findUnique({
            where: { uuid: uuid },
        });
        if (!existingCategory) {
            throw new HttpException(`Category not found`, HttpStatus.NOT_FOUND);
        }
        return this.prisma.category.delete({
            where: { uuid: uuid },
        });
    }
}
