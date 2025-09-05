import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Simulasikan user login (ganti nanti dengan real decode JWT)
    request.user = { sub: 'cmf6a9s9k0000rq29d73mtnfc' };

    return true;
  }
}
