import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filters
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // Multer configuration for file uploads (in-memory for B2)
  // Files are stored in memory and uploaded to Backblaze B2
  // Max file size: 100MB (limited by B2)
  app.useBodyParser('json', { limit: '10mb' });
  app.useBodyParser('urlencoded', { limit: '10mb', extended: true });

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || '',
    credentials: true,
  });

  // Swagger API documentation
  setupSwagger(app);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 ConnectX Dating Platform Backend running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
