import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

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

    async create(createCountryDto: Prisma.CountryCreateInput): Promise<any> {
        return this.prisma.country.create({
            data: createCountryDto
        });
    }

    async update(uuid: string, updateCountryDto: Prisma.CountryUpdateInput): Promise<any> {
        return this.prisma.country.update({
            where: { uuid: uuid },
            data: updateCountryDto
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.country.delete({
            where: { uuid: uuid }
        });
    }

}
