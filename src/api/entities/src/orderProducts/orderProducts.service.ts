import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class OrderProductsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.orderProduct.findMany();
    }

    async findOne(orderUuid: string, productUuid: string): Promise<any> {
        return this.prisma.orderProduct.findUnique({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } },
        });
    }

    async create(createOrderProductDto: Prisma.OrderProductCreateInput): Promise<any> {
        return this.prisma.orderProduct.create({
            data: createOrderProductDto
        });
    }

    async update(orderUuid: string, productUuid: string, updateOrderProductDto: Prisma.OrderProductUpdateInput): Promise<any> {
        return this.prisma.orderProduct.update({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } },
            data: updateOrderProductDto
        });
    }

    async delete(orderUuid: string, productUuid: string): Promise<any> {
        return this.prisma.orderProduct.delete({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } }
        });
    }
}
