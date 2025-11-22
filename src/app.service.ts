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

  // 🔹 METRICS – dipakai oleh /metrics
  getMetrics() {
    const load = os.loadavg(); // [1m, 5m, 15m]
    const cpuCount = os.cpus()?.length || 1;

    const cpuPercent = Math.round(
      Math.min(100, (load[0] / cpuCount) * 100),
    );

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercent = Math.round((usedMem / totalMem) * 100);

    const processUptimeSec = Math.round(process.uptime());
    const processMem = process.memoryUsage();

    const serverTime = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
    });

    return {
      cpu: cpuPercent,                           // %
      memory: memoryPercent,                     // %
      loadAvg1: Number(load[0].toFixed(2)),      // 1m
      loadAvg5: Number(load[1].toFixed(2)),      // 5m
      loadAvg15: Number(load[2].toFixed(2)),     // 15m
      processUptimeSec,                          // detik
      totalMemGb: Number((totalMem / 1024 / 1024 / 1024).toFixed(2)),
      usedMemGb: Number((usedMem / 1024 / 1024 / 1024).toFixed(2)),
      nodeRssMb: Number((processMem.rss / 1024 / 1024).toFixed(1)),
      nodeHeapUsedMb: Number((processMem.heapUsed / 1024 / 1024).toFixed(1)),
      serverTime,                                // waktu server realtime
    };
  }

  async getApiHomepage(): Promise<string> {
    // Cek koneksi database (sekali saat load halaman)
    let dbStatus = '🟢 CONNECTED';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = '🔴 FAILED';
    }

    // Ambil versi dari package.json
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const version = pkg.version ?? 'unknown';

    // Waktu lokal awal (nanti akan dioverride oleh metrics)
    const now = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
    });

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
        margin-bottom: 1.5rem;
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

      .metrics {
        width: 420px;
        max-width: 90vw;
        background: #111;
        border: 1px solid #0f0;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 0 20px rgba(0,255,0,0.25);
      }

      .metrics-title {
        font-size: 14px;
        color: #ffb300;
        margin-bottom: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .metric-row {
        margin-bottom: 1rem;
      }

      .metric-label {
        font-size: 13px;
        color: #ccc;
        margin-bottom: 0.25rem;
        display: flex;
        justify-content: space-between;
      }

      .metric-label span.value {
        color: #0f0;
      }

      .bar {
        width: 100%;
        height: 14px;
        background: #222;
        border-radius: 999px;
        overflow: hidden;
        box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.8);
      }

      .bar-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #00ff66, #ffee00, #ff3300);
        border-radius: 999px;
        transition: width 0.5s ease-out;
      }

      .bar-fill.cpu {
        box-shadow: 0 0 12px rgba(255, 51, 0, 0.6);
      }

      .bar-fill.mem {
        box-shadow: 0 0 12px rgba(0, 255, 102, 0.6);
      }

      .metrics-extra {
        margin-top: 1rem;
        border-top: 1px dashed #0f0;
        padding-top: 0.75rem;
        font-size: 12px;
        color: #ccc;
      }

      .extra-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;
      }

      .extra-label {
        color: #888;
      }

      .extra-value {
        color: #0f0;
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
      <div>
        <span class="label">Time</span>:
        <span id="time-text">${now}</span>
      </div>
      <div><span class="label">Node.js</span>: ${process.version}</div>
      <div><span class="label">OS</span>: ${os.platform()} (${os.arch()})</div>
    </div>

    <div class="metrics">
      <div class="metrics-title">REALTIME SYSTEM LOAD</div>

      <div class="metric-row">
        <div class="metric-label">
          <span>CPU Load</span>
          <span class="value" id="cpu-label">- %</span>
        </div>
        <div class="bar">
          <div class="bar-fill cpu" id="cpu-bar"></div>
        </div>
      </div>

      <div class="metric-row">
        <div class="metric-label">
          <span>Memory Usage</span>
          <span class="value" id="mem-label">- %</span>
        </div>
        <div class="bar">
          <div class="bar-fill mem" id="mem-bar"></div>
        </div>
      </div>

      <div class="metrics-extra">
        <div class="extra-row">
          <span class="extra-label">Uptime</span>
          <span class="extra-value" id="uptime-text">-</span>
        </div>
        <div class="extra-row">
          <span class="extra-label">Load Avg (1 / 5 / 15)</span>
          <span class="extra-value" id="loadavg-text">-</span>
        </div>
        <div class="extra-row">
          <span class="extra-label">RAM Used</span>
          <span class="extra-value" id="ram-detail-text">-</span>
        </div>
        <div class="extra-row">
          <span class="extra-label">Node Memory</span>
          <span class="extra-value" id="node-mem-text">-</span>
        </div>
      </div>
    </div>

    <script>
      (function () {
        function updateBars(cpu, mem) {
          var cpuBar = document.getElementById('cpu-bar');
          var memBar = document.getElementById('mem-bar');
          var cpuLabel = document.getElementById('cpu-label');
          var memLabel = document.getElementById('mem-label');

          if (!cpuBar || !memBar || !cpuLabel || !memLabel) {
            return;
          }

          cpuBar.style.width = Math.max(0, Math.min(100, cpu)) + '%';
          memBar.style.width = Math.max(0, Math.min(100, mem)) + '%';

          cpuLabel.textContent = cpu + '%';
          memLabel.textContent = mem + '%';
        }

        function formatUptime(totalSeconds) {
          if (typeof totalSeconds !== 'number' || !isFinite(totalSeconds)) {
            return '-';
          }
          var s = Math.max(0, Math.floor(totalSeconds));
          var d = Math.floor(s / 86400);
          s -= d * 86400;
          var h = Math.floor(s / 3600);
          s -= h * 3600;
          var m = Math.floor(s / 60);
          s -= m * 60;
          var parts = [];
          if (d > 0) parts.push(d + 'd');
          if (h > 0 || parts.length) parts.push(h + 'h');
          if (m > 0 || parts.length) parts.push(m + 'm');
          parts.push(s + 's');
          return parts.join(' ');
        }

        function updateExtra(data) {
          var uptimeEl = document.getElementById('uptime-text');
          var loadEl = document.getElementById('loadavg-text');
          var ramEl = document.getElementById('ram-detail-text');
          var nodeMemEl = document.getElementById('node-mem-text');

          if (uptimeEl && typeof data.processUptimeSec === 'number') {
            uptimeEl.textContent = formatUptime(data.processUptimeSec);
          }

          if (loadEl && typeof data.loadAvg1 === 'number') {
            var t = data.loadAvg1 + ' / ' + data.loadAvg5 + ' / ' + data.loadAvg15;
            loadEl.textContent = t;
          }

          if (ramEl && typeof data.totalMemGb === 'number') {
            var ramText = data.usedMemGb + ' GB / ' + data.totalMemGb + ' GB';
            ramEl.textContent = ramText;
          }

          if (nodeMemEl && typeof data.nodeRssMb === 'number') {
            var nmText = data.nodeRssMb + ' MB RSS, ' + data.nodeHeapUsedMb + ' MB heap';
            nodeMemEl.textContent = nmText;
          }
        }

        function tick() {
          fetch('/metrics', { headers: { 'Accept': 'application/json' } })
            .then(function (res) {
              if (!res.ok) throw new Error('HTTP ' + res.status);
              return res.json();
            })
            .then(function (data) {
              var cpu = typeof data.cpu === 'number' ? data.cpu : 0;
              var mem = typeof data.memory === 'number' ? data.memory : 0;
              updateBars(cpu, mem);
              updateExtra(data);

              if (data.serverTime) {
                var timeEl = document.getElementById('time-text');
                if (timeEl) {
                  timeEl.textContent = data.serverTime;
                }
              }
            })
            .catch(function (err) {
              // boleh di-log kalau perlu
              // console.log('metrics error:', err);
            });
        }

        tick();
        setInterval(tick, 1500);
      })();
    </script>
  </body>
</html>
    `;
  }
}
