import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class WorkspaceService {
    constructor(private prisma: PrismaClient) { }

    async createWorkspace(name: string, userId: string) {
        return this.prisma.workspaceUser.create({
            data: {
                role: 'owner',
                user: { connect: { id: userId } },
                workspace: {
                    create: { name },
                },
            },
            include: {
                workspace: true,
            },
        });
    }
    async updateWorkspace(id: string, name: string, userId: string) {
        const rel = await this.prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId, workspaceId: id } },
        });

        if (!rel || rel.role !== 'owner') {
            throw new ForbiddenException('Hanya owner yang bisa mengubah workspace.');
        }

        return this.prisma.workspace.update({
            where: { id },
            data: { name },
        });
    }

    async deleteWorkspace(id: string, userId: string) {
        const rel = await this.prisma.workspaceUser.findUnique({
            where: { userId_workspaceId: { userId, workspaceId: id } },
        });

        if (!rel || rel.role !== 'owner') {
            throw new ForbiddenException('Hanya owner yang bisa menghapus workspace.');
        }

        // Hapus semua relasi WorkspaceUser terlebih dahulu
        await this.prisma.workspaceUser.deleteMany({
            where: { workspaceId: id },
        });

        return this.prisma.workspace.delete({
            where: { id },
        });
    }

    async getAllWorkspaces(userId: string) {
        return this.prisma.workspaceUser.findMany({
            where: { userId },
            include: { workspace: true },
        });
    }
    //---------------------
    //OTHER METHODS
    //---------------------


    async inviteUserToWorkspace(
        workspaceId: string,
        requesterId: string,
        userId: string,
        role: string,
    ) {
        // (Optional) Validasi apakah requesterId adalah pemilik workspace

        try {
            const invited = await this.prisma.workspaceUser.create({
                data: {
                    userId,
                    workspaceId,
                    role,
                },
                include: {
                    workspace: true,
                },
            });

            return {
                message: 'User berhasil diundang ke workspace',
                data: invited,
            };
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ForbiddenException('User sudah tergabung di workspace ini');
            }

            throw error; // biar error lainnya tetap dilempar
        }
    }
    async removeUserFromWorkspace(workspaceId: string, requesterId: string, targetUserId: string) {
        // 1. Cek apakah requester adalah owner
        const requester = await this.prisma.workspaceUser.findUnique({
            where: {
                userId_workspaceId: {
                    userId: requesterId,
                    workspaceId,
                },
            },
        });

        if (!requester || requester.role !== 'owner') {
            throw new ForbiddenException('Hanya owner yang dapat menghapus user dari workspace');
        }

        // 2. Cek apakah target adalah owner
        const target = await this.prisma.workspaceUser.findUnique({
            where: {
                userId_workspaceId: {
                    userId: targetUserId,
                    workspaceId,
                },
            },
        });

        if (!target) {
            throw new NotFoundException('User tidak ditemukan di workspace ini');
        }

        if (target.role === 'owner') {
            throw new ForbiddenException('Owner tidak dapat dihapus dari workspace');
        }

        // 3. Hapus user dari workspace
        await this.prisma.workspaceUser.delete({
            where: {
                userId_workspaceId: {
                    userId: targetUserId,
                    workspaceId,
                },
            },
        });

        return { message: 'User berhasil dihapus dari workspace' };
    }

}
