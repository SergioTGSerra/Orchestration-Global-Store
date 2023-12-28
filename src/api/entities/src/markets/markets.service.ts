import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

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

    async create(createMarketDto: Prisma.MarketCreateInput): Promise<any> {
        return this.prisma.market.create({
            data: createMarketDto
        });
    }

    async update(uuid: string, updateMarketDto: Prisma.MarketUpdateInput): Promise<any> {
        return this.prisma.market.update({
            where: { uuid: uuid },
            data: updateMarketDto
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.market.delete({
            where: { uuid: uuid }
        });
    }

}
