import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class MarketsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.market.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.market.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(data: any): Promise<any> {
        return this.prisma.market.create({
            data: data
        });
    }

    async update(uuid: string, data: any): Promise<any> {
        return this.prisma.market.update({
            where: { uuid: uuid },
            data: data
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.market.delete({
            where: { uuid: uuid }
        });
    }

}
