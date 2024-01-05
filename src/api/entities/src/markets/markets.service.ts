import { HttpException, Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class MarketsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const markets = await this.prisma.market.findMany({});
        if (markets.length === 0) {
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
    
    async create(createMarketDto: Prisma.MarketCreateInput[]): Promise<any> {
        let duplicateMarkets: string[] = [];
        for (let i = 0; i < createMarketDto.length; i++) {
            const existingMarket = await this.prisma.market.findUnique({
                where: { unique_name_region: { name: createMarketDto[i].name, region: createMarketDto[i].region } },
            });
            if (existingMarket) {
                duplicateMarkets.push(createMarketDto[i].name as string);
            } else {
                await this.prisma.market.create({
                    data: createMarketDto[i],
                });
            }
        }
        if (duplicateMarkets.length > 0) {
            throw new HttpException(`Markets with names ${duplicateMarkets.join(', ')} already exist`, HttpStatus.CONFLICT);
        }
    }
    
    async update(uuid: string, updateMarketDto: Prisma.MarketUpdateInput): Promise<any> {
        const existingMarket = await this.prisma.market.findUnique({
            where: { uuid: uuid },
        });
        if (!existingMarket) {
            throw new NotFoundException(`Market not found`);
        }
        const existingNameAndRegion = await this.prisma.market.findUnique({
            where: {
                unique_name_region: {
                    name: (updateMarketDto.name as Prisma.StringFieldUpdateOperationsInput)?.set || existingMarket.name,
                    region: (updateMarketDto.region as Prisma.StringFieldUpdateOperationsInput)?.set || existingMarket.region,
                },
            },
        });
        if (existingNameAndRegion) {
            throw new HttpException('Market name and region already exist', HttpStatus.CONFLICT);
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
