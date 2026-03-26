import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/entities/user.entity';
import { UserProfile } from './modules/users/entities/user-profile.entity';
import { UserPhoto } from './modules/users/entities/user-photo.entity';
import { Interest } from './modules/users/entities/interest.entity';
import { UserInterest } from './modules/users/entities/user-interest.entity';
import { Match } from './modules/matching/entities/match.entity';
import { Post } from './modules/posts/entities/post.entity';
import { PostMedia } from './modules/posts/entities/post-media.entity';
import { PostLike } from './modules/posts/entities/post-like.entity';
import { PostComment } from './modules/posts/entities/post-comment.entity';
import { Message } from './modules/chat/entities/message.entity';
import { Conversation } from './modules/chat/entities/conversation.entity';
import { MessageRead } from './modules/chat/entities/message-read.entity';
import { Stream } from './modules/streams/entities/stream.entity';
import { StreamViewer } from './modules/streams/entities/stream-viewer.entity';
import { Report } from './modules/moderation/entities/report.entity';
import { UserVerification } from './modules/moderation/entities/user-verification.entity';
import { Block } from './modules/users/entities/block.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
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
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get('DB_USER') || '',
        password: configService.get('DB_PASSWORD') || '',
        database: configService.get('DB_NAME') || '',
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        entities: [
          User,
          UserProfile,
          UserPhoto,
          Interest,
          UserInterest,
          Match,
          Post,
          PostMedia,
          PostLike,
          PostComment,
          Message,
          Conversation,
          MessageRead,
          Stream,
          StreamViewer,
          Report,
          UserVerification,
          Block,
          Notification,
        ],
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
