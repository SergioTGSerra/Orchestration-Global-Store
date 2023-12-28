import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
    private prisma = new PrismaClient();

    
    async findAll(): Promise<any[]> {
        return this.prisma.category.findMany();
    }
    
    async findOne(uuid: string): Promise<any> {
        return this.prisma.category.findUnique({
            where: { uuid: uuid },
        });
    }

    async create(createCategoryDto: Prisma.CategoryCreateInput): Promise<any> {
        return this.prisma.category.create({
          data: createCategoryDto,
        });
      }

    async update(uuid: string, updateCategoryDto: Prisma.CategoryUpdateInput): Promise<any> {
    return this.prisma.category.update({
        where: { uuid: uuid },
            data: updateCategoryDto,
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.category.delete({
            where: { uuid: uuid },
        });
    }

}
