import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const products = await this.prisma.product.findMany();
        if (!products) {
            throw new NotFoundException('Products not found');
        }
        return products;
    }

    async findOne(uuid: string): Promise<any> {
        const product = await this.prisma.product.findUnique({
            where: { uuid: uuid },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }

    async findOrders(uuid: string): Promise<any> {
        const product = await this.prisma.product.findUnique({
            where: { uuid: uuid },
            select: { ProductOrders: {include: {Product: true,},}, },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        if (product.ProductOrders.length === 0) {
            throw new NotFoundException('This product has no orders');
        }
        return product.ProductOrders;
    }

    async create(createProductDto: Prisma.ProductCreateInput): Promise<any> {
        return this.prisma.product.create({
            data: createProductDto
        });
    }

    async update(uuid: string, updateProductDto: Prisma.ProductUpdateInput): Promise<any> {
        const existingProduct = await this.prisma.product.findUnique({
            where: { uuid: uuid },
        });
        if (!existingProduct) {
            throw new NotFoundException(`Product not found`);
        }
        return this.prisma.product.update({
            where: { uuid: uuid },
            data: updateProductDto
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingProduct = await this.prisma.product.findUnique({
            where: { uuid: uuid },
        });
        if (!existingProduct) {
            throw new NotFoundException(`Product not found`);
        }
        return this.prisma.product.delete({
            where: { uuid: uuid }
        });
    }
}
