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

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
