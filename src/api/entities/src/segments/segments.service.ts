import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

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

    async create(createSegmentDto: Prisma.SegmentCreateInput): Promise<any> {
        return this.prisma.segment.create({
            data: createSegmentDto
        });
    }

    async update(uuid: string, updateSegmentDto: Prisma.SegmentUpdateInput): Promise<any> {
        return this.prisma.segment.update({
            where: { uuid: uuid },
            data: updateSegmentDto
        });
    }

    async delete(uuid: string): Promise<any> {
        return this.prisma.segment.delete({
            where: { uuid: uuid }
        });
    }

}
