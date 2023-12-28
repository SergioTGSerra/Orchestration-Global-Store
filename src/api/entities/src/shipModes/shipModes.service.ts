import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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

    async create(data: any): Promise<any> {
        return this.prisma.shipMode.create({
            data: data
        });
    }

    async update(uuid: string, data: any): Promise<any> {
        return this.prisma.shipMode.update({
            where: { uuid: uuid },
            data: data
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.shipMode.delete({
            where: { uuid: uuid }
        });
    }
}
