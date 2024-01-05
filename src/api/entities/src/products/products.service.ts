import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const products = await this.prisma.product.findMany({
            include: {
                Category: {
                    select: {
                        uuid: true,
                        name: true,
                    },
                },
            },
        });
    
        if (products.length === 0) {
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

    async create(createProductDto: Prisma.ProductCreateInput[]): Promise<any> {
        const duplicateProducts: string[] = [];
        const upsertPromises: Promise<any>[] = [];
    
        for (const productDto of createProductDto) {
            upsertPromises.push(
                this.prisma.product.upsert({
                    where: { uuid: productDto.uuid },
                    create: productDto,
                    update: productDto, // This can be adjusted based on your update logic
                })
            );
        }
    
        await Promise.all(upsertPromises);
    
        if (duplicateProducts.length > 0) {
            throw new HttpException(`Products already exist`, HttpStatus.CONFLICT);
        }
    }    

    async update(uuid: string, updateProductDto: Prisma.ProductUpdateInput): Promise<any> {
        const existingProduct = await this.prisma.product.findUnique({
            where: { uuid: uuid },
        });
        if (!existingProduct) {
            throw new NotFoundException(`Product not found`);
        }
        if (updateProductDto.uuid) {
            const existingProduct = await this.prisma.product.findUnique({
                where: { uuid: updateProductDto.uuid as string },
            });
            if (existingProduct) {
                throw new HttpException('Product already exists', HttpStatus.CONFLICT);
            }
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
