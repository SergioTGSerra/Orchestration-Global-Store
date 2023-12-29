import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class ShipModesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const shipModes = await this.prisma.shipMode.findMany();
        if (!shipModes) {
            throw new NotFoundException('Ship modes not found');
        }
        return shipModes;
    }

    async findOne(uuid: string): Promise<any> {
        const shipMode = await this.prisma.shipMode.findUnique({
            where: { uuid: uuid },
        });
        if (!shipMode) {
            throw new NotFoundException('ShipMode not found');
        }
        return shipMode;
    }

    async findOrders(uuid: string): Promise<any> {
        const shipMode = await this.prisma.shipMode.findUnique({
            where: { uuid: uuid },
            select: { Orders: true },
        });
        if (!shipMode) {
            throw new NotFoundException('ShipMode not found');
        }
        if (shipMode.Orders.length === 0) {
            throw new NotFoundException('This ship mode has no orders');
        }
        return shipMode.Orders;
    }

    async create(createShipModeDto: Prisma.ShipModeCreateInput): Promise<any> {
        const existingName = await this.prisma.shipMode.findUnique({
            where: { name: createShipModeDto.name },
        });
        if (existingName) {
            throw new NotFoundException('Ship mode name already exists');
        }
        return this.prisma.shipMode.create({
            data: createShipModeDto,
        });
    }

    async update(uuid: string, updateShipModeDto: Prisma.ShipModeUpdateInput): Promise<any> {
        const existingShipMode = await this.prisma.shipMode.findUnique({
            where: { uuid: uuid },
        });
        if (!existingShipMode) {
            throw new NotFoundException(`Ship mode not found`);
        }
        if (updateShipModeDto.name && updateShipModeDto.name !== existingShipMode.name) {
            const existingName = await this.prisma.shipMode.findUnique({
                where: { name: updateShipModeDto.name as string, NOT: { uuid: uuid } },
            });
            if (existingName) {
                throw new HttpException('Ship mode name already exists', HttpStatus.BAD_REQUEST);
            }
        }
        return this.prisma.shipMode.update({
            where: { uuid: uuid },
            data: updateShipModeDto,
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingShipMode = await this.prisma.shipMode.findUnique({
            where: { uuid: uuid },
        });
        if (!existingShipMode) {
            throw new HttpException('Ship mode name already exists', HttpStatus.BAD_REQUEST);
        }
        return this.prisma.shipMode.delete({
            where: { uuid: uuid },
        });
    }
}
