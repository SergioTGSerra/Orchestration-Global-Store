import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrioritiesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.priority.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.priority.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(createPriorityDto: Prisma.PriorityCreateInput): Promise<any> {
        return this.prisma.priority.create({
            data: createPriorityDto
        });
    }

    async update(uuid: string, updatePriorityDto: Prisma.PriorityUpdateInput): Promise<any> {
        return this.prisma.priority.update({
            where: { uuid: uuid },
            data: updatePriorityDto
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.priority.delete({
            where: { uuid: uuid }
        });
    }
}
