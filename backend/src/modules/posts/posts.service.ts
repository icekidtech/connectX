import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostMedia } from './entities/post-media.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
    @InjectRepository(PostComment)
    private postCommentRepository: Repository<PostComment>,
    @InjectRepository(PostMedia)
    private postMediaRepository: Repository<PostMedia>,
  ) {}

  async getFeed(page: number = 1, limit: number = 10) {
    return await this.postRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author', 'author.profile', 'media', 'likes', 'comments'],
      order: { createdAt: 'DESC' },
    });
  }

  async createPost(userId: string, caption: string, hashtags: string[] = [], isNsfw: boolean = false) {
    const post = this.postRepository.create({
      authorId: userId,
      caption,
      hashtags: hashtags.map((tag) => tag.toLowerCase()),
      isNsfw,
      visibility: 'public',
    });

    return await this.postRepository.save(post);
  }

  async getPostById(postId: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author', 'author.profile', 'media', 'likes', 'comments'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 10) {
    return await this.postRepository.find({
      where: { authorId: userId },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author', 'media', 'likes', 'comments'],
      order: { createdAt: 'DESC' },
    });
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.getPostById(postId);

    if (post.authorId !== userId) {
      throw new Error('Unauthorized to delete this post');
    }

    await this.postRepository.delete({ id: postId });
    return { success: true };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.getPostById(postId);

    // Check if already liked
    const existingLike = await this.postLikeRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      // Unlike
      await this.postLikeRepository.delete(existingLike.id);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      // Like
      const like = this.postLikeRepository.create({ postId, userId });
      await this.postLikeRepository.save(like);
      post.likeCount += 1;
    }

    await this.postRepository.save(post);
    return post;
  }

  async getPostLikes(postId: string, page: number = 1, limit: number = 10) {
    return await this.postLikeRepository.find({
      where: { postId },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'user.profile'],
    });
  }

  async commentOnPost(postId: string, userId: string, content: string) {
    const post = await this.getPostById(postId);

    const comment = this.postCommentRepository.create({
      postId,
      authorId: userId,
      content,
    });

    await this.postCommentRepository.save(comment);
    post.commentCount += 1;
    await this.postRepository.save(post);

    return comment;
  }

  async getPostComments(postId: string, page: number = 1, limit: number = 10) {
    return await this.postCommentRepository.find({
      where: { postId, parentCommentId: null },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author', 'author.profile', 'replies'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.postCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new Error('Unauthorized to delete this comment');
    }

    await this.postCommentRepository.delete({ id: commentId });
    return { success: true };
  }

  async getHashtagPosts(hashtag: string, page: number = 1, limit: number = 10) {
    return await this.postRepository
      .createQueryBuilder('post')
      .where(':hashtag = ANY(post.hashtags)', { hashtag: hashtag.toLowerCase() })
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .leftJoinAndSelect('post.media', 'media')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.comments', 'comments')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }
}
