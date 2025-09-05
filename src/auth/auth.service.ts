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

    async login(identifier: string, password: string) {
        const user = await this.userService.findByEmailOrPhone(identifier);

        if (!user) {
            throw new UnauthorizedException('User tidak ditemukan');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new UnauthorizedException('Password salah');
        }

        const payload = { sub: user.id };
        const token = this.jwtService.sign(payload, { expiresIn: '1d' });

        await prisma.token.create({
            data: {
                token,
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
        });
        const { password: _, ...userWithoutPassword } = user;
        return { accessToken: token, user: userWithoutPassword };

    }

}
