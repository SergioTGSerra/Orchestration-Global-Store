import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CountriesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.country.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.country.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(data: any): Promise<any> {
        return this.prisma.country.create({
            data: data
        });
    }

    async update(uuid: string, data: any): Promise<any> {
        return this.prisma.country.update({
            where: { uuid: uuid },
            data: data
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.country.delete({
            where: { uuid: uuid }
        });
    }

}
