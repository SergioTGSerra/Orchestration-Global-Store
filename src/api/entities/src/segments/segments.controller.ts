import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { SegmentsService } from './segments.service';

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
    async create(@Body() data: { name: string }) {
        return this.segmentsService.create(data);
    }

    @Put(':uuid')
    async update(@Param('uuid') uuid: string, @Body() data: { name?: string }) {
        return this.segmentsService.update(uuid, data);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuid: string) {
        return this.segmentsService.delete(uuid);
    }
}
