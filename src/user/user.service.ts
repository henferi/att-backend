import { Injectable } from '@nestjs/common';
import { ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
    async createUser(email: string, phone: string, name: string, password: string) {
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            throw new ConflictException('Email sudah terdaftar');
        }

        if (phone) {
            const existingPhone = await prisma.user.findUnique({ where: { phone } });
            if (existingPhone) {
                throw new ConflictException('Nomor HP sudah terdaftar');
            }
        }

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

    async findByEmailOrPhone(identifier: string) {
        return prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phone: identifier },
                ],
            },
        });
    }
    
    async findByEmail(email: string) {
        return prisma.user.findFirst({
            where: {
                email: email 
            },
        });
    }
    
}