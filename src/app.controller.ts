import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { FastifyReply } from 'fastify';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // HTML homepage status backend
  @Get()
  async root(@Res() res: FastifyReply) {
    const html = await this.appService.getApiHomepage();
    res.header('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  // Endpoint JSON metrics untuk dipakai script di halaman
  @Get('metrics')
  async getMetrics(@Res() res: FastifyReply) {
    const metrics = this.appService.getMetrics();
    res.header('Content-Type', 'application/json; charset=utf-8');
    return res.send(metrics);
  }
}
