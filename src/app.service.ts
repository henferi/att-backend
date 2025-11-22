import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getApiHomepage(): Promise<string> {
    // Cek koneksi database
    let dbStatus = '🟢 CONNECTED';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = '🔴 FAILED';
    }

    // Ambil versi dari package.json
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const version = pkg.version ?? 'unknown';

    // Waktu lokal
    const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // Return HTML response
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>API Backend Service</title>
    <style>
      body {
        background: #0f0f0f;
        color: #0f0;
        font-family: 'Courier New', monospace;
        margin: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }

      .header {
        text-align: center;
        font-size: 24px;
        color: #00ffb3;
        margin-bottom: 2rem;
      }

      h1 {
        color: #f55;
        margin-bottom: 0.5rem;
      }

      .info {
        line-height: 1.6;
        background: #111;
        color: #0f0;
        padding: 2rem;
        border: 1px solid #0f0;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0,255,0,0.3);
      }

      .label {
        color: #aaa;
        width: 150px;
        display: inline-block;
      }

      code {
        background: #1a1a1a;
        padding: 0.5rem;
        border-radius: 8px;
        display: block;
        margin-top: 1rem;
        color: #ffaa00;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>🚀 BACKEND SERVER IS RUNNING</h1>
      <p>💻 API Backend Service</p>
      <code>STATUS: OK(200) • SECURE • FASTIFY</code>
    </div>

    <div class="info">
      <div><span class="label">App Version</span>: v${version}</div>
      <div><span class="label">DB Status</span>: ${dbStatus}</div>
      <div><span class="label">Time</span>: ${now}</div>
      <div><span class="label">Node.js</span>: ${process.version}</div>
      <div><span class="label">OS</span>: ${os.platform()} (${os.arch()})</div>
    </div>
  </body>
</html>
    `;
  }
}
