import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrioritiesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const priorities = await this.prisma.priority.findMany();
        if (priorities.length === 0) {
            throw new NotFoundException('Priorities not found');
        }
        return priorities;
    }

    async findOne(uuid: string): Promise<any> {
        const priority = await this.prisma.priority.findUnique({
            where: { uuid: uuid },
        });
        if (!priority) {
            throw new NotFoundException('Priority not found');
        }
        return priority;
    }

    async findOrders(uuid: string): Promise<any> {
        const priority = await this.prisma.priority.findUnique({
            where: { uuid: uuid },
            select: { Orders: true },
        });
        if (!priority) {
            throw new NotFoundException('Priority not found');
        }
        if (priority.Orders.length === 0) {
            throw new NotFoundException('This priority has no orders');
        }
        return priority.Orders;
    }

    async create(createPriorityDto: Prisma.PriorityCreateInput[]): Promise<any> {
        let duplicatePriorities: string[] = [];
        for (let i = 0; i < createPriorityDto.length; i++) {
            const existingPriority = await this.prisma.priority.findUnique({
                where: { name: createPriorityDto[i].name },
            });

            if (existingPriority) {
                duplicatePriorities.push(createPriorityDto[i].name as string);
            } else {
                await this.prisma.priority.create({
                    data: createPriorityDto[i],
                });
            }
        }
        if (duplicatePriorities.length > 0) {
            throw new HttpException(`Priorities with names ${duplicatePriorities.join(', ')} already exist`, HttpStatus.CONFLICT);
        }
    }

    async update(uuid: string, updatePriorityDto: Prisma.PriorityUpdateInput): Promise<any> {
        const existingPriority = await this.prisma.priority.findUnique({
            where: { uuid: uuid },
        });
        if (!existingPriority) {
            throw new NotFoundException(`Priority not found`);
        }
        if (updatePriorityDto.name && updatePriorityDto.name !== existingPriority.name) {
            const existingName = await this.prisma.priority.findUnique({
                where: { name: updatePriorityDto.name as string, NOT: { uuid: uuid } },
            });
            if (existingName) {
                throw new HttpException('Priority name already exists', HttpStatus.CONFLICT);
            }
        }
        return this.prisma.priority.update({
            where: { uuid: uuid },
            data: updatePriorityDto
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingPriority = await this.prisma.priority.findUnique({
            where: { uuid: uuid },
        });
        if (!existingPriority) {
            throw new NotFoundException(`Priority not found`);
        }
        return this.prisma.priority.delete({
            where: { uuid: uuid },
        });
    }
}
