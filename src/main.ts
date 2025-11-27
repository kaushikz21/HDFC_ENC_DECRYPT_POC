import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express'; // Import Express to access body parsers

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- FIX: Enable parsing of HDFC's specific content type ---
  // This tells NestJS: "If you see 'application/jose', just give me the raw string."
  app.use(express.text({ type: 'application/jose' }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();