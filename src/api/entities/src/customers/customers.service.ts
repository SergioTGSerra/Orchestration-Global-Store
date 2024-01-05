import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const customers = await this.prisma.customer.findMany({
            include: {
                State: {
                    select: {
                        uuid: true,
                        name: true,
                    },
                },
                Country: {
                    select: {
                        uuid: true,
                        name: true,
                    },
                },
                Segment: {
                    select: {
                        uuid: true,
                        name: true,
                    },
                },
            },
        });
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

    async create(createCustomerDto: Prisma.CustomerCreateInput[]): Promise<any> {
        const duplicateCustomers: string[] = [];
        const upsertPromises: Promise<any>[] = [];
    
        for (const customerDto of createCustomerDto) {
            upsertPromises.push(
                this.prisma.customer.upsert({
                    where: { uuid: customerDto.uuid },
                    create: customerDto,
                    update: customerDto,
                })
            );
        }
    
        await Promise.all(upsertPromises);
    
        if (duplicateCustomers.length > 0) {
            throw new HttpException(`Customers already exist`, HttpStatus.CONFLICT);
        }
    }
    

    async update(uuid: string, updateCustomerDto: Prisma.CustomerUpdateInput): Promise<any> {
        const existingCustomer = await this.prisma.customer.findUnique({
            where: { uuid: uuid },
        });
        if (!existingCustomer) {
            throw new NotFoundException(`Customer not found`);
        }
        if (updateCustomerDto.uuid) {
            const existingCustomer = await this.prisma.customer.findUnique({
                where: { uuid: updateCustomerDto.uuid as string },
            });
            if (existingCustomer) {
                throw new HttpException("Customer already exists", HttpStatus.CONFLICT);
            }
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
