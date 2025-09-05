import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
    async createUser(email: string, phone: string, name: string, password: string) {
        const hash = await bcrypt.hash(password, 10);
        return prisma.user.create({
            data: {
                email,
                phone,
                name,
                password: hash,
            },
        });
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }
}
