import { Controller, Post, Body, UnauthorizedException, UseGuards, Req, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SwitchWorkspaceDto } from './dto/switch-workspace.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const prisma = new PrismaClient();


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) { }



  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.phone, dto.name, dto.password);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.identifier, dto.password);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req() req: any,
    @Body('refreshToken') refreshToken: string,
  ) {
    const userId = req.user.userId; // dari JwtStrategy.validate
    return this.authService.logout(userId, refreshToken);
  }
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token tidak valid atau kadaluarsa');
    }

    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // ❌ Hapus token lama
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    // 🔐 Buat token baru
    const payload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    const newRefreshToken = await prisma.refreshToken.create({
      data: {
        token: uuidv4(),
        userId: user.id,
        expiresAt: dayjs().add(7, 'days').toDate(),
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
    };
  }
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.identifier);
  }
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('switch-workspace')
  async switchWorkspace(
    @Body() dto: SwitchWorkspaceDto,
    @Req() req: any,
  ) {
    // req.user bentuknya: { userId, workspaceId }
    const userId = req.user.userId;
    return this.authService.switchWorkspace(userId, dto.workspaceId);
  }
}