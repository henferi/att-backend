import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 🔐 Helmet dengan CSP yang tetap aman tapi mengizinkan inline script & style
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        // Semua resource default dari origin yang sama
        defaultSrc: ["'self'"],
        // Izinkan script dari origin sendiri + inline <script> (buat halaman status)
        scriptSrc: ["'self'", "'unsafe-inline'"],
        // Izinkan style dari origin sendiri + inline <style>
        styleSrc: ["'self'", "'unsafe-inline'"],
        // Izinkan gambar dari origin sendiri & data URL (kalau nanti ada icon base64)
        imgSrc: ["'self'", 'data:'],
        // fetch / XHR hanya boleh ke origin sendiri (contoh: /metrics)
        connectSrc: ["'self'"],
      },
    },
  });

  await app.register(rateLimit, {
    max: 1000,
    timeWindow: '1 minute',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
