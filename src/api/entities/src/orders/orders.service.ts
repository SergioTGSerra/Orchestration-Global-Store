import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const orders = await this.prisma.order.findMany();

        if (orders.length === 0) {
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
            include: { OrderProducts: {include: {Product: true,},}, },
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
        if (createOrderDto.shipping_cost < 0) {
            throw new HttpException('Shipping cost must be greater than or equal to 0', HttpStatus.BAD_REQUEST);
        }

        if (createOrderDto.ship_date < createOrderDto.order_date) {
            throw new HttpException('Ship date must be greater than or equal to order date', HttpStatus.BAD_REQUEST);
        }

        return this.prisma.order.create({
            data: createOrderDto
        });
    }

    async update(uuid: string, updateOrderDto: Prisma.OrderUpdateInput): Promise<any> {
        const shippingCostValue = typeof updateOrderDto.shipping_cost === 'number' ? updateOrderDto.shipping_cost : 0;

        const existingOrder = await this.prisma.order.findUnique({
            where: { uuid: uuid },
        });

        if (shippingCostValue < 0) {
            throw new HttpException('Shipping cost must be greater than or equal to 0', HttpStatus.BAD_REQUEST);
        }

        if (updateOrderDto.ship_date < updateOrderDto.order_date) {
            throw new HttpException('Ship date must be greater than or equal to order date', HttpStatus.BAD_REQUEST);
        }

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
