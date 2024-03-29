import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@Injectable()
export class StatesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        const states = await this.prisma.state.findMany();
        if (!states) {
            throw new NotFoundException('States not found');
        }
        return states;
    }

    async findOne(uuid: string): Promise<any> {
        const state = await this.prisma.state.findUnique({
            where: { uuid: uuid },
        });
        if (!state) {
            throw new NotFoundException('State not found');
        }
        return state;
    }

    async findCustomers(uuid: string): Promise<any> {
        const state = await this.prisma.state.findUnique({
            where: { uuid: uuid },
            select: { Customers: true },
        });
        if (!state) {
            throw new NotFoundException('State not found');
        }
        if (state.Customers.length === 0) {
            throw new NotFoundException('This state has no customers');
        }
        return state.Customers;
    }

    async create(createStateDto: CreateStateDto[]): Promise<any> {
        const duplicateStates: string[] = [];
        const upsertPromises: Promise<any>[] = [];
    
        for (const stateDto of createStateDto) {
            upsertPromises.push(
                this.prisma.state.upsert({
                    where: { name: stateDto.name },
                    create: stateDto,
                    update: stateDto,
                })
            );
        }
    
        await Promise.all(upsertPromises);
    
        if (duplicateStates.length > 0) {
            throw new HttpException(`States with names ${duplicateStates.join(', ')} already exist`, HttpStatus.CONFLICT);
        }
    }
    

    async update(uuid: string, updateStateDto: UpdateStateDto): Promise<any> {
        const existingState = await this.prisma.state.findUnique({
            where: { uuid: uuid },
        });
        if (!existingState) {
            throw new NotFoundException(`State not found`);
        }
        if (updateStateDto.name && updateStateDto.name !== existingState.name) {
            const existingName = await this.prisma.state.findUnique({
                where: { name: updateStateDto.name as string },
            });
            if (existingName) {
                throw new HttpException('State name already exists', HttpStatus.CONFLICT);
            }
        }
        return this.prisma.state.update({
            where: { uuid: uuid },
            data: updateStateDto,
        });
    }

    async delete(uuid: string): Promise<any> {
        const existingState = await this.prisma.state.findUnique({
            where: { uuid: uuid },
        });
        if (!existingState) {
            throw new NotFoundException(`State not found`);
        }
        return this.prisma.state.delete({
            where: { uuid: uuid },
        });
    }
}
