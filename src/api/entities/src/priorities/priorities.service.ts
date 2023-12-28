import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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

    async create(data: any): Promise<any> {
        return this.prisma.priority.create({
            data: data
        });
    }

    async update(uuid: string, data: any): Promise<any> {
        return this.prisma.priority.update({
            where: { uuid: uuid },
            data: data
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.priority.delete({
            where: { uuid: uuid }
        });
    }
}
