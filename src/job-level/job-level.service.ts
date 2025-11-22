import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateJobLevelDto } from './dto/create-job-level.dto';
import { UpdateJobLevelDto } from './dto/update-job-level.dto';

const prisma = new PrismaClient();

@Injectable()
export class JobLevelService {
    async create(dto: CreateJobLevelDto, user: any) {
        return prisma.jobLevel.create({
            data: {
                name: dto.name,
                userId: user.userId,         // ⬅️ ganti dari user.sub
                workspaceId: user.workspaceId,
            },
        });
    }

    async findAll(user: any) {
        return prisma.jobLevel.findMany({
            where: { workspaceId: user.workspaceId },
        });
    }

    async update(id: string, dto: UpdateJobLevelDto, user: any) {
        const jobLevel = await prisma.jobLevel.findUnique({ where: { id } });
        if (!jobLevel || jobLevel.workspaceId !== user.workspaceId) {
            throw new NotFoundException('Data tidak ditemukan');
        }

        return prisma.jobLevel.update({
            where: { id },
            data: { name: dto.name },
        });
    }

    async delete(id: string, user: any) {
        const jobLevel = await prisma.jobLevel.findUnique({ where: { id } });
        if (!jobLevel || jobLevel.workspaceId !== user.workspaceId) {
            throw new NotFoundException('Data tidak ditemukan');
        }

        return prisma.jobLevel.delete({ where: { id } });
    }
}
