import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { FastifyReply } from 'fastify'; // ✅ Bener ini bro

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async root(@Res() res: FastifyReply) {
    const html = await this.appService.getApiHomepage();
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
