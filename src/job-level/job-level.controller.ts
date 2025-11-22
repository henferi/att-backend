import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    UseGuards,
} from '@nestjs/common';
import { JobLevelService } from './job-level.service';
import { CreateJobLevelDto } from './dto/create-job-level.dto';
import { UpdateJobLevelDto } from './dto/update-job-level.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('job-levels')
@UseGuards(JwtAuthGuard)
export class JobLevelController {
    constructor(private readonly service: JobLevelService) { }

    @Post()
    create(@Body() dto: CreateJobLevelDto, @Req() req: any) {
        return this.service.create(dto, req.user);
    }

    @Get()
    findAll(@Req() req: any) {
        return this.service.findAll(req.user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateJobLevelDto, @Req() req: any) {
        return this.service.update(id, dto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: any) {
        return this.service.delete(id, req.user);
    }
}
