import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TasksService } from './task/task.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
    }),
  );

  app.enableCors({
    origin: true,
  });

  await app.listen(process.env.PORT || 8000);
}
bootstrap();
