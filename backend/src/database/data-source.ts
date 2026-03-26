import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { UserProfile } from '../modules/users/entities/user-profile.entity';
import { UserPhoto } from '../modules/users/entities/user-photo.entity';
import { Interest } from '../modules/users/entities/interest.entity';
import { UserInterest } from '../modules/users/entities/user-interest.entity';
import { Match } from '../modules/matching/entities/match.entity';
import { Post } from '../modules/posts/entities/post.entity';
import { PostMedia } from '../modules/posts/entities/post-media.entity';
import { PostLike } from '../modules/posts/entities/post-like.entity';
import { PostComment } from '../modules/posts/entities/post-comment.entity';
import { Message } from '../modules/chat/entities/message.entity';
import { Conversation } from '../modules/chat/entities/conversation.entity';
import { MessageRead } from '../modules/chat/entities/message-read.entity';
import { Stream } from '../modules/streams/entities/stream.entity';
import { StreamViewer } from '../modules/streams/entities/stream-viewer.entity';
import { Report } from '../modules/moderation/entities/report.entity';
import { UserVerification } from '../modules/moderation/entities/user-verification.entity';
import { Block } from '../modules/users/entities/block.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: (process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432),
  username: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  synchronize: process.env.NODE_ENV !== '',
  logging: process.env.NODE_ENV !== '',
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
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
