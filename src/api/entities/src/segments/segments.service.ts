import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SegmentsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.segment.findMany();
    }

    async findOne(uuid: string): Promise<any> {
        return this.prisma.segment.findUnique({
            where: { uuid: uuid, },
        });
    }

    async create(data: any): Promise<any> {
        return this.prisma.segment.create({
            data: data
        });
    }

    async update(uuid: string, data: any): Promise<any> {
        return this.prisma.segment.update({
            where: { uuid: uuid },
            data: data
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.segment.delete({
            where: { uuid: uuid }
        });
    }

}
