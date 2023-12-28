import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StatesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.state.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.state.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(data: any): Promise<any> {
        return this.prisma.state.create({
            data: data
        });
    }

    async update(uuid: string, data: any): Promise<any> {
        return this.prisma.state.update({
            where: { uuid: uuid },
            data: data
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.state.delete({
            where: { uuid: uuid }
        });
    }
}
