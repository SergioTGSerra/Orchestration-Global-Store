import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

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

    async create(createStateDto: Prisma.StateCreateInput): Promise<any> {
        return this.prisma.state.create({
            data: createStateDto
        });
    }

    async update(uuid: string, updateStateDto: Prisma.StateUpdateInput): Promise<any> {
        return this.prisma.state.update({
            where: { uuid: uuid },
            data: updateStateDto
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.state.delete({
            where: { uuid: uuid }
        });
    }
}
