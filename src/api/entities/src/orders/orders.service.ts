import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const orders = await this.prisma.order.findMany({
            include: {
                Customer: {
                    select: {
                        uuid: true,
                        name: true,
                    },
                },
                Market: {
                    select: {
                        uuid: true,
                        name: true,
                    },
                },
                ShipMode: {
                    select: {
                        uuid: true,
                        name: true,
                    },
                },
                Priority: {
                    select: {
                        uuid: true,
                        name: true,
                    },
                },
            },
        });
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

    async create(createOrderDto: Prisma.OrderCreateInput[]): Promise<any> {
        let duplicateOrders: string[] = [];
        let invalidShippingCost: string[] = [];
        let invalidShipDate: string[] = [];
        for (let i = 0; i < createOrderDto.length; i++) {
            const existingOrder = await this.prisma.order.findUnique({
                where: { uuid: createOrderDto[i].uuid },
            });
            if (existingOrder) {
                duplicateOrders.push(createOrderDto[i].uuid as string);
            } else if (createOrderDto[i].shipping_cost < 0) {
                    invalidShippingCost.push(createOrderDto[i].uuid as string);
            } else if (createOrderDto[i].ship_date < createOrderDto[i].order_date) {
                invalidShipDate.push(createOrderDto[i].uuid as string);
            } else {
                await this.prisma.order.create({
                    data: createOrderDto[i],
                });
            }
        }
        if (duplicateOrders.length > 0) {
            throw new HttpException(`Orders already exist`, HttpStatus.CONFLICT);
        } else if (invalidShippingCost.length > 0) {
            throw new HttpException(`Shipping cost must be greater than or equal to 0`, HttpStatus.BAD_REQUEST);
        } else if (invalidShipDate.length > 0) {
            throw new HttpException(`Ship date must be greater than or equal to order date`, HttpStatus.BAD_REQUEST);
        }
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

        if (updateOrderDto.uuid) {
            const existingOrder = await this.prisma.order.findUnique({
                where: { uuid: updateOrderDto.uuid as string },
            });
            if (existingOrder) {
                throw new HttpException('Order already exists', HttpStatus.CONFLICT);
            }
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
