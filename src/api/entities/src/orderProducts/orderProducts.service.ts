import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { OrderProductsModule } from './orderProducts.module';

@Injectable()
export class OrderProductsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const orderProducts = await this.prisma.orderProduct.findMany({
            include: { 
                Order: true,
                Product: true,
             },
        });
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

    async create(createOrderProductDto: Prisma.OrderProductUncheckedCreateInput[]): Promise<any> {
        let duplicateOrderProducts: string[] = [];
        let invalidQuantities: string[] = [];
        let invalidDiscounts: string[] = [];
        
        for (const orderProductDto of createOrderProductDto) {
            const existingOrderProduct = await this.prisma.orderProduct.findUnique({
                where: { order_uuid_product_uuid: { order_uuid: orderProductDto.order_uuid, product_uuid: orderProductDto.product_uuid } }
            });
    
            if (existingOrderProduct) {
                duplicateOrderProducts.push(`${orderProductDto.order_uuid}-${orderProductDto.product_uuid}`);
            } else if (orderProductDto.quantity < 1) {
                invalidQuantities.push(`${orderProductDto.order_uuid}-${orderProductDto.product_uuid}`);
            } else if (orderProductDto.discount < 0 || orderProductDto.discount > 1) {
                invalidDiscounts.push(`${orderProductDto.order_uuid}-${orderProductDto.product_uuid}`);
            } else {
                await this.prisma.orderProduct.create({
                    data: orderProductDto,
                });
            }
        }
    
        if (duplicateOrderProducts.length > 0) {
            throw new HttpException(`OrderProducts already exist`, HttpStatus.CONFLICT);
        } else if (invalidQuantities.length > 0) {
            throw new HttpException(`OrderProducts have invalid quantities`, HttpStatus.BAD_REQUEST);
        } else if (invalidDiscounts.length > 0) {
            throw new HttpException(`OrderProducts have invalid discounts`, HttpStatus.BAD_REQUEST);
        }
    }
    
          
    async update(orderUuid: string, productUuid: string, updateOrderProductDto: Prisma.OrderProductUpdateInput): Promise<any> {
        const discountValue = typeof updateOrderProductDto.discount === 'number' ? updateOrderProductDto.discount : 0;
        const salesValue = typeof updateOrderProductDto.sales === 'number' ? updateOrderProductDto.sales : 0;
        const quantityValue = typeof updateOrderProductDto.quantity === 'number' ? updateOrderProductDto.quantity : 0;

        const existingOrderProduct = await this.prisma.orderProduct.findUnique({
            where: { order_uuid_product_uuid: { order_uuid: orderUuid, product_uuid: productUuid } }
        });

        if (updateOrderProductDto.Order && updateOrderProductDto.Order.connect) {
            const existingOrder = await this.prisma.order.findUnique({
                where: { uuid: updateOrderProductDto.Order.connect.uuid },
            });
            if (!existingOrder) {
                throw new NotFoundException('Order not found');
            }
        }

        if (updateOrderProductDto.Product && updateOrderProductDto.Product.connect) {
            const existingProduct = await this.prisma.product.findUnique({
                where: { uuid: updateOrderProductDto.Product.connect.uuid },
            });
            if (!existingProduct) {
                throw new NotFoundException('Product not found');
            }
        }

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
