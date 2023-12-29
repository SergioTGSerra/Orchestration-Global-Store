import { HttpException, Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class MarketsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const markets = await this.prisma.market.findMany({});
        if (!markets) {
            throw new NotFoundException('Markets not found');
        }
        return markets;
    }

    async findOne(uuid: string): Promise<any> {
        const market = await this.prisma.market.findUnique({
            where: { uuid: uuid },
        });
        if (!market) {
            throw new NotFoundException('Market not found');
        }
        return market;
    }

    async findOrders(uuid: string): Promise<any> {
        const market = await this.prisma.market.findUnique({
            where: { uuid: uuid },
            select: { Orders: true },
        });
        if (!market) {
            throw new NotFoundException('Market not found');
        }
        if (market.Orders.length === 0) {
            throw new NotFoundException('This market has no orders');
        }
        return market.Orders;
    }

    async create(createMarketDto: Prisma.MarketCreateInput): Promise<any> {
        const existingName = await this.prisma.market.findUnique({
            where: { name: createMarketDto.name },
        });
        if (existingName) {
            throw new HttpException('Market name already exists', HttpStatus.BAD_REQUEST)
        }
        return this.prisma.market.create({
            data: createMarketDto,
        });
    }

    async update(uuid: string, updateMarketDto: Prisma.MarketUpdateInput): Promise<any> {
        const existingMarket = await this.prisma.market.findUnique({
            where: { uuid: uuid },
        });
        if (!existingMarket) {
            throw new NotFoundException(`Market not found`);
        }
        if (updateMarketDto.name && updateMarketDto.name !== existingMarket.name) {
            const existingName = await this.prisma.market.findUnique({
                where: { name: updateMarketDto.name as string, NOT: { uuid: uuid } },
            });
            if (existingName) {
                throw new HttpException('Market name already exists', HttpStatus.BAD_REQUEST)
            }
        }
        return this.prisma.market.update({
            where: { uuid: uuid },
            data: updateMarketDto,
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingMarket = await this.prisma.market.findUnique({
            where: { uuid: uuid },
        });
        if (!existingMarket) {
            throw new NotFoundException(`Market not found`);
        }
        return this.prisma.market.delete({
            where: { uuid: uuid }
        });
    }

}
