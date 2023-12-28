import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class ShipModesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.shipMode.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.shipMode.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(createShipModeDto: Prisma.ShipModeCreateInput): Promise<any> {
        return this.prisma.shipMode.create({
            data: createShipModeDto
        });
    }

    async update(uuid: string, updateShipModeDto: Prisma.ShipModeUpdateInput): Promise<any> {
        return this.prisma.shipMode.update({
            where: { uuid: uuid },
            data: updateShipModeDto
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.shipMode.delete({
            where: { uuid: uuid }
        });
    }
}
