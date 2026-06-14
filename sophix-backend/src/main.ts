import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('1️⃣ Starting app...');

  const app = await NestFactory.create(AppModule);

  console.log('2️⃣ App created');

  app.useGlobalPipes(new ValidationPipe());

  console.log('3️⃣ Pipes set');

  await app.listen(process.env.PORT ?? 3000);

  console.log('4️⃣ Server listening');
}
bootstrap();

