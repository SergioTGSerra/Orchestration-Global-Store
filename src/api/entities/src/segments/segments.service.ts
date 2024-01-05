import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class SegmentsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const segments = await this.prisma.segment.findMany();
        if (!segments) {
            throw new NotFoundException('Segments not found');
        }
        return segments;
    }

    async findOne(uuid: string): Promise<any> {
        const segment = await this.prisma.segment.findUnique({
            where: { uuid: uuid },
        });
        if (!segment) {
            throw new NotFoundException('Segment not found');
        }
        return segment;
    }

    async findCustomers(uuid: string): Promise<any> {
        const segment = await this.prisma.segment.findUnique({
            where: { uuid: uuid },
            select: { Customers: true },
        });
        if (!segment) {
            throw new NotFoundException('Segment not found');
        }
        if (segment.Customers.length === 0) {
            throw new NotFoundException('This segment has no customers');
        }
        return segment.Customers;
    }

    async create(createSegmentDto: Prisma.SegmentCreateInput[]): Promise<any> {
        let duplicateSegments: string[] = [];
        for (let i = 0; i < createSegmentDto.length; i++) {
            const existingSegment = await this.prisma.segment.findUnique({
                where: { name: createSegmentDto[i].name },
            });

            if (existingSegment) {
                duplicateSegments.push(createSegmentDto[i].name as string);
            } else {
                await this.prisma.segment.create({
                    data: createSegmentDto[i],
                });
            }
        }
        if (duplicateSegments.length > 0) {
            throw new HttpException(`Segments with names ${duplicateSegments.join(', ')} already exist`, HttpStatus.CONFLICT);
        }
    }

    async update(uuid: string, updateSegmentDto: Prisma.SegmentUpdateInput): Promise<any> {
        const existingSegment = await this.prisma.segment.findUnique({
            where: { uuid: uuid },
        });
        if (!existingSegment) {
            throw new NotFoundException(`Segment not found`);
        }
        if (updateSegmentDto.name && updateSegmentDto.name !== existingSegment.name) {
            const existingName = await this.prisma.segment.findUnique({
                where: { name: updateSegmentDto.name as string, NOT: { uuid: uuid } },
            });
            if (existingName) {
                throw new HttpException('Segment name already exists', HttpStatus.CONFLICT);
            }
        }
        return this.prisma.segment.update({
            where: { uuid: uuid },
            data: updateSegmentDto,
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingSegment = await this.prisma.segment.findUnique({
            where: { uuid: uuid },
        });
        if (!existingSegment) {
            throw new NotFoundException(`Segment not found`);
        }
        return this.prisma.segment.delete({
            where: { uuid: uuid }
        });
    }

}
