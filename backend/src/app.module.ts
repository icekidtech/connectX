import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './database/data-source';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { ChatModule } from './modules/chat/chat.module';
import { MatchingModule } from './modules/matching/matching.module';
import { StreamsModule } from './modules/streams/streams.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...AppDataSource.options,
      }),
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    ChatModule,
    MatchingModule,
    StreamsModule,
    ModerationModule,
    NotificationsModule,
  ],
})
export class AppModule {}
