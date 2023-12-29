import { HttpException, Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class CountriesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const countries = await this.prisma.country.findMany();
        if (!countries) {
            throw new NotFoundException('Countries not found');
        }
        return countries;
    }

    async findOne(uuid: string): Promise<any> {
        const country = await this.prisma.country.findUnique({
            where: { uuid: uuid },
        });
        if (!country) {
            throw new NotFoundException('Country not found');
        }
        return country;
    }

    async findCustomers(uuid: string): Promise<any> {
        const country = await this.prisma.country.findUnique({
            where: { uuid: uuid },
            select: { Customers: true },
        });
        if (!country) {
            throw new NotFoundException('Country not found');
        }
        if (country.Customers.length === 0) {
            throw new NotFoundException('This country has no customers');
        }
        return country.Customers;
    }

    async create(createCountryDto: Prisma.CountryCreateInput): Promise<any> {
        const existingName = await this.prisma.country.findUnique({
            where: { name: createCountryDto.name },
        });
        if (existingName) {
            throw new HttpException('Country name already exists', HttpStatus.BAD_REQUEST);
        }
        return this.prisma.country.create({
            data: createCountryDto,
        });
    }

    async update(uuid: string, updateCountryDto: Prisma.CountryUpdateInput): Promise<any> {
        const existingCountry = await this.prisma.country.findUnique({
            where: { uuid: uuid },
        });
        if (!existingCountry) {
            throw new HttpException(`Country not found`, HttpStatus.NOT_FOUND);
        }
        if (updateCountryDto.name && updateCountryDto.name !== existingCountry.name) {
            const existingName = await this.prisma.country.findUnique({
                where: { name: updateCountryDto.name as string, NOT: { uuid: uuid } },
            });
            if (existingName) {
                throw new HttpException('Country name already exists', HttpStatus.BAD_REQUEST);
            }
        }
        return this.prisma.country.update({
            where: { uuid: uuid },
            data: updateCountryDto,
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingCountry = await this.prisma.country.findUnique({
            where: { uuid: uuid },
        });
        if (!existingCountry) {
            throw new HttpException(`Country not found`, HttpStatus.NOT_FOUND);
        }
        return this.prisma.country.delete({
            where: { uuid: uuid },
        });
    }

}
