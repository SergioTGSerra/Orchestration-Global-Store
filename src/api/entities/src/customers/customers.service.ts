import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const customers = await this.prisma.customer.findMany();
        if (customers.length === 0) {
            throw new NotFoundException('Customers not found');
        }
        return customers;
    }

    async findOne(uuid: string): Promise<any> {
        const customer = await this.prisma.customer.findUnique({
            where: { uuid: uuid },
        });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }
        return customer;
    }

    async findOrders(uuid: string): Promise<any> {
        const customer = await this.prisma.customer.findUnique({
            where: { uuid: uuid },
            select: { Orders: true },
        });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }
        if (customer.Orders.length === 0) {
            throw new NotFoundException('This customer has no orders');
        }
        return customer.Orders;
    }

    async create(createCustomerDto: Prisma.CustomerCreateInput): Promise<any> {
        return this.prisma.customer.create({
            data: createCustomerDto,
        });
    }

    async update(uuid: string, updateCustomerDto: Prisma.CustomerUpdateInput): Promise<any> {
        const existingCustomer = await this.prisma.customer.findUnique({
            where: { uuid: uuid },
        });
        if (!existingCustomer) {
            throw new NotFoundException(`Customer not found`);
        }
        return this.prisma.customer.update({
            where: { uuid: uuid },
            data: updateCustomerDto,
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingCustomer = await this.prisma.customer.findUnique({
            where: { uuid: uuid },
        });
        if (!existingCustomer) {
            throw new NotFoundException(`Customer not found`);
        }
        return this.prisma.customer.delete({
            where: { uuid: uuid }
        });
    }
}
