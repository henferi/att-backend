import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    async register(email: string, phone: string, name: string, password: string) {
        const user = await this.userService.createUser(email, phone, name, password);
        return { message: 'Register success', user };
    }

    async login(identifier: string, password: string) {
        const user = await this.userService.findByEmailOrPhone(identifier);
        if (!user) {
            throw new UnauthorizedException('User tidak ditemukan');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new UnauthorizedException('Password salah');
        }

        // Cari workspace pertama user
        const workspaceUser = await prisma.workspaceUser.findFirst({
            where: { userId: user.id },
        });

        if (!workspaceUser) throw new UnauthorizedException('Workspace tidak ditemukan');

        const payload = {
            sub: user.id,
            workspaceId: workspaceUser.workspaceId,
        };

        // ✅ Access token hanya berlaku 15 menit
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });

        // ✅ Refresh token berlaku 7 hari
        const refresh = await this.generateRefreshToken(user.id);

        // Simpan accessToken ke DB
        await prisma.token.create({
            data: {
                token: accessToken,
                userId: user.id,
                expiresAt: dayjs().add(15, 'minutes').toDate(),
            },
        });

        const { password: _, ...userWithoutPassword } = user;

        return {
            accessToken,
            refreshToken: refresh.token,
            user: userWithoutPassword,
        };
    }

    async logout(userId: string, refreshToken: string) {
        const existing = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
        });

        if (!existing || existing.userId !== userId) {
            throw new UnauthorizedException('Refresh token tidak valid');
        }

        await prisma.refreshToken.delete({
            where: { token: refreshToken },
        });

        return { message: 'Logout berhasil' };
    }

    private async generateRefreshToken(userId: string) {
        const token = uuidv4(); // random secure token
        const expiresAt = dayjs().add(7, 'days').toDate();

        return prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    }

    async forgotPassword(identifier: string) {
        const user = await this.userService.findByEmailOrPhone(identifier);
        if (!user) {
            throw new UnauthorizedException('User tidak ditemukan');
        }

        const token = randomBytes(32).toString('hex');
        const expiresAt = dayjs().add(30, 'minutes').toDate();

        await prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        // TODO: Kirim token ke email (atau WA) — contoh kirim via console log
        console.log(`Reset password token: ${token}`);

        return { message: 'Link reset telah dikirim ke email jika terdaftar' };
    }

    async resetPassword(token: string, newPassword: string) {
        const record = await prisma.passwordResetToken.findUnique({ where: { token } });
        if (!record || record.expiresAt < new Date()) {
            throw new UnauthorizedException('Token tidak valid atau kadaluarsa');
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: record.userId },
            data: { password: hashed },
        });

        // Hapus token setelah dipakai
        await prisma.passwordResetToken.delete({ where: { token } });

        return { message: 'Password berhasil direset' };
    }

    // ✅ SWITCH WORKSPACE
    async switchWorkspace(userId: string, workspaceId: string) {
        // 1. Pastikan user memang anggota workspace tsb
        const membership = await prisma.workspaceUser.findFirst({
            where: {
                userId,
                workspaceId,
            },
            include: {
                workspace: true,
            },
        });

        if (!membership) {
            throw new UnauthorizedException('Anda tidak terdaftar di workspace ini');
        }

        // 2. Pastikan workspace masih ada (sebenarnya sudah ke-include di atas, tapi kita cek saja)
        const workspace = membership.workspace;

        if (!workspace) {
            throw new UnauthorizedException('Workspace tidak ditemukan');
        }

        // 3. Buat access token baru dengan workspaceId yang BARU
        const payload = {
            sub: userId,
            workspaceId: workspaceId,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '15m',
        });

        // 4. Simpan accessToken ke tabel token (sama seperti login)
        await prisma.token.create({
            data: {
                token: accessToken,
                userId,
                expiresAt: dayjs().add(15, 'minutes').toDate(),
            },
        });

        return {
            accessToken,
            workspace: {
                id: workspace.id,
                name: workspace.name,
            },
        };
    }
}
