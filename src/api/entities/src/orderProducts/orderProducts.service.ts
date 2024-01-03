import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class OrderProductsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const orderProducts = await this.prisma.orderProduct.findMany();
        if (orderProducts.length === 0) {
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
        if (createOrderProductDto.quantity < 1) {
            throw new HttpException('Quantity must be greater than 0', HttpStatus.BAD_REQUEST);
        }

        if (createOrderProductDto.discount < 0) {
            throw new HttpException('Discount must be greater than or equal to 0', HttpStatus.BAD_REQUEST);
        }

        if (createOrderProductDto.discount > 1) {
            throw new HttpException('Discount must be less than or equal to 1', HttpStatus.BAD_REQUEST);
        }

        if (createOrderProductDto.sales < 0) {
            throw new HttpException('Sales must be greater than or equal to 0', HttpStatus.BAD_REQUEST);
        }

        return this.prisma.orderProduct.create({
            data: createOrderProductDto
        });
    }

    async update(orderUuid: string, productUuid: string, updateOrderProductDto: Prisma.OrderProductUpdateInput): Promise<any> {
        const discountValue = typeof updateOrderProductDto.discount === 'number' ? updateOrderProductDto.discount : 0;
        const salesValue = typeof updateOrderProductDto.sales === 'number' ? updateOrderProductDto.sales : 0;
        const quantityValue = typeof updateOrderProductDto.quantity === 'number' ? updateOrderProductDto.quantity : 0;

        const existingOrderProduct = await this.prisma.orderProduct.findUnique({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } }
        });

        if (!existingOrderProduct) {
            throw new NotFoundException(`OrderProduct not found`);
        }

        if (quantityValue < 1) {
            throw new HttpException('Quantity must be greater than 0', HttpStatus.BAD_REQUEST);
        }	

        if (discountValue < 0) {
            throw new HttpException('Discount must be greater than or equal to 0', HttpStatus.BAD_REQUEST);
        }

        if (discountValue > 1) {
            throw new HttpException('Discount must be less than or equal to 1', HttpStatus.BAD_REQUEST);
        }

        if (salesValue < 0) {
            throw new HttpException('Sales must be greater than or equal to 0', HttpStatus.BAD_REQUEST);
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
