import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.customer.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.customer.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(createCustomerDto: Prisma.CustomerCreateInput): Promise<any> {
        return this.prisma.customer.create({
            data: createCustomerDto
        });
    }

    async update(uuid: string, updateCustomerDto: Prisma.CustomerUpdateInput): Promise<any> {
        return this.prisma.customer.update({
            where: { uuid: uuid },
            data: updateCustomerDto
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.customer.delete({
            where: { uuid: uuid }
        });
    }
}
