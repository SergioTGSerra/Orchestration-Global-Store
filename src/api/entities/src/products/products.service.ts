import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.product.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.product.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(createProductDto: Prisma.ProductCreateInput): Promise<any> {
        return this.prisma.product.create({
            data: createProductDto
        });
    }

    async update(uuid: string, updateProductDto: Prisma.ProductUpdateInput): Promise<any> {
        return this.prisma.product.update({
            where: { uuid: uuid },
            data: updateProductDto
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.product.delete({
            where: { uuid: uuid }
        });
    }
}
