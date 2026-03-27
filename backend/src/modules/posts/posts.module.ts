import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostMedia } from './entities/post-media.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { FileUploadController } from './controllers/file-upload.controller';
import { B2StorageService } from '../../common/services/b2-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostMedia, PostLike, PostComment])],
  providers: [PostsService, B2StorageService],
  controllers: [PostsController, FileUploadController],
  exports: [PostsService, B2StorageService],
})
export class PostsModule {}
