import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CategoriesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.category.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.category.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(data: any): Promise<any> {
        return this.prisma.category.create({
            data: data
        });
    }

    async update(uuid: string, data: any): Promise<any> {
        return this.prisma.category.update({
            where: { uuid: uuid },
            data: data
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.category.delete({
            where: { uuid: uuid }
        });
    }

}
