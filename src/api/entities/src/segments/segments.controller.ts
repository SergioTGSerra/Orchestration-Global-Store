import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { Prisma } from '@prisma/client';

@Controller('segments')
export class SegmentsController {
    constructor(private readonly segmentsService: SegmentsService) { }

    @Get()
    async findAll() {
        return this.segmentsService.findAll();
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string) {
        return this.segmentsService.findOne(uuid);
    }

    @Post()
    async create(@Body() createSegmentDto: Prisma.SegmentCreateInput) {
        return this.segmentsService.create(createSegmentDto);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() updateSegmentDto: Prisma.SegmentUpdateInput) {
        return this.segmentsService.update(uuid, updateSegmentDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.segmentsService.delete(uuid);
    }
}
