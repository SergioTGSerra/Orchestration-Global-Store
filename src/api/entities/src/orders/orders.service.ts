import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const orders = await this.prisma.order.findMany();
        if (!orders) {
            throw new NotFoundException('Orders not found');
        }
        return orders;
    }

    async findOne(uuid: string): Promise<any> {
        const order = await this.prisma.order.findUnique({
            where: { uuid: uuid },
        });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        return order;
    }

    async findProducts(uuid: string): Promise<any> {
        const order = await this.prisma.order.findUnique({
            where: { uuid: uuid },
            select: { OrderProducts: {include: {Product: true,},}, },
        });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (order.OrderProducts.length === 0) {
            throw new NotFoundException('This order has no products');
        }
        return order.OrderProducts;
    }

    async create(createOrderDto: Prisma.OrderCreateInput): Promise<any> {
        return this.prisma.order.create({
            data: createOrderDto
        });
    }

    async findOrderProducts(uuid: string): Promise<any> {
        const order = await this.prisma.order.findUnique({
            where: { uuid: uuid },
            select: { OrderProducts: true },
        });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        if (order.OrderProducts.length === 0) {
            throw new NotFoundException('This order has no order products');
        }
        return order.OrderProducts;
    }

    async update(uuid: string, updateOrderDto: Prisma.OrderUpdateInput): Promise<any> {
        const existingOrder = await this.prisma.order.findUnique({
            where: { uuid: uuid },
        });
        if (!existingOrder) {
            throw new NotFoundException(`Order not found`);
        }
        return this.prisma.order.update({
            where: { uuid: uuid },
            data: updateOrderDto
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingOrder = await this.prisma.order.findUnique({
            where: { uuid: uuid },
        });
        if (!existingOrder) {
            throw new NotFoundException(`Order not found`);
        }
        return this.prisma.order.delete({
            where: { uuid: uuid }
        });
    }
}
