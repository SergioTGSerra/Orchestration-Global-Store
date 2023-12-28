import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.order.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.order.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(createOrderDto: Prisma.OrderCreateInput): Promise<any> {
        return this.prisma.order.create({
            data: createOrderDto
        });
    }

    async update(uuid: string, updateOrderDto: Prisma.OrderUpdateInput): Promise<any> {
        return this.prisma.order.update({
            where: { uuid: uuid },
            data: updateOrderDto
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.order.delete({
            where: { uuid: uuid }
        });
    }
}
