import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('ConnectX Dating Platform API')
    .setDescription('Complete API documentation for the ConnectX dating and social platform')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://api.connectx.com', 'Production Server (coming soon)')
    .addTag('Auth', 'Authentication endpoints - signup, login, token refresh')
    .addTag('Users', 'User profile management - get, update, preferences, photos')
    .addTag(
      'Posts',
      'Social feed - create posts, comments, likes',
    )
    .addTag(
      'Chat',
      'Real-time messaging - conversations, messages, typing indicators',
    )
    .addTag(
      'Matching',
      'Smart matching - recommendations, compatibility scoring',
    )
    .addTag('Streams', 'Live streaming - create, view, live chat')
    .addTag(
      'Moderation',
      'Admin moderation - reports, verifications, user actions',
    )
    .addTag(
      'Notifications',
      'Notification management - list, mark read, preferences',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      filter: true,
      showRequestHeaders: true,
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 2,
    },
  });
}
