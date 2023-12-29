import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class OrderProductsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const orderProducts = await this.prisma.orderProduct.findMany();
        if (!orderProducts) {
            throw new NotFoundException('OrderProducts not found');
        }
        return orderProducts;
    }

    async findOne(orderUuid: string, productUuid: string): Promise<any> {
        const orderProduct = await this.prisma.orderProduct.findUnique({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } }
        });
        if (!orderProduct) {
            throw new NotFoundException('OrderProduct not found');
        }
        return orderProduct;
    }

    async create(createOrderProductDto: Prisma.OrderProductCreateInput): Promise<any> {
        return this.prisma.orderProduct.create({
            data: createOrderProductDto
        });
    }

    async update(orderUuid: string, productUuid: string, updateOrderProductDto: Prisma.OrderProductUpdateInput): Promise<any> {
        const existingOrderProduct = await this.prisma.orderProduct.findUnique({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } }
        });
        if (!existingOrderProduct) {
            throw new NotFoundException(`OrderProduct not found`);
        }
        return this.prisma.orderProduct.update({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } },
            data: updateOrderProductDto
        });
    }

    async delete(orderUuid: string, productUuid: string): Promise<any> {
        const existingOrderProduct = await this.prisma.orderProduct.findUnique({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } }
        });
        if (!existingOrderProduct) {
            throw new NotFoundException(`OrderProduct not found`);
        }
        return this.prisma.orderProduct.delete({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } }
        });
    }
}
