import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) { }

    async register(email: string, phone: string, name: string, password: string) {
        const user = await this.userService.createUser(email, phone, name, password);
        return { message: 'Register success', user };
    }

    async login(email: string, password: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new UnauthorizedException('User not found');

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new UnauthorizedException('Wrong password');

        const payload = { sub: user.id };
        const token = this.jwtService.sign(payload, {
            expiresIn: '1d',
        });

        // Simpan token ke tabel Token
        await prisma.token.create({
            data: {
                token,
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 hari
            },
        });

        return { accessToken: token, user };
    }
}
