import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { PostMedia } from './entities/post-media.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';


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
    const [posts, total] = await this.postRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author', 'author.profile', 'media', 'likes', 'comments'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: posts,
      page,
      limit,
      total,
    };
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
      where: { postId, parentCommentId: IsNull() },
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

  /**
   * Update a post (caption, hashtags, visibility)
   * Only the author can update their post
   */
  async updatePost(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.getPostById(postId);

    if (post.authorId !== userId) {
      throw new BadRequestException('Unauthorized: Only post author can update');
    }

    // Update allowed fields
    if (updatePostDto.caption !== undefined) {
      post.caption = updatePostDto.caption;
    }

    if (updatePostDto.hashtags !== undefined) {
      post.hashtags = updatePostDto.hashtags.map((tag) => tag.toLowerCase());
    }

    if (updatePostDto.isNsfw !== undefined) {
      post.isNsfw = updatePostDto.isNsfw;
    }

    if (updatePostDto.visibility !== undefined) {
      post.visibility = updatePostDto.visibility;
    }

    return await this.postRepository.save(post);
  }

  /**
   * Get nested replies for a comment
   */
  async getCommentReplies(commentId: string, page: number = 1, limit: number = 10) {
    const parentComment = await this.postCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!parentComment) {
      throw new NotFoundException('Comment not found');
    }

    return await this.postCommentRepository.find({
      where: { parentCommentId: commentId },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['author', 'author.profile'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Like or unlike a comment
   * Toggle behavior: if already liked, remove like; otherwise add like
   */
  async likeComment(commentId: string, userId: string) {
    const comment = await this.postCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.postLikeRepository.findOne({
      where: { commentId, userId },
    });

    if (existingLike) {
      // Unlike
      await this.postLikeRepository.delete(existingLike.id);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      // Like
      const like = this.postLikeRepository.create({
        commentId,
        userId,
      });
      await this.postLikeRepository.save(like);
      comment.likeCount += 1;
    }

    await this.postCommentRepository.save(comment);
    return comment;
  }

  /**
   * Get likes on a comment
   */
  async getCommentLikes(commentId: string, page: number = 1, limit: number = 10) {
    const comment = await this.postCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return await this.postLikeRepository.find({
      where: { commentId },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'user.profile'],
    });
  }

  /**
   * Update a comment
   * Only the author can update their comment
   */
  async updateCommentText(commentId: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.postCommentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new BadRequestException('Unauthorized: Only comment author can update');
    }

    comment.content = updateCommentDto.content;
    return await this.postCommentRepository.save(comment);
  }

  /**
   * Update createPost to accept optional media URLs
   */
  async createPostWithMedia(
    userId: string,
    createPostDto: CreatePostDto,
    mediaUrls?: string[]
  ) {
    const post = this.postRepository.create({
      authorId: userId,
      caption: createPostDto.caption,
      hashtags: createPostDto.hashtags?.map((tag) => tag.toLowerCase()) || [],
      isNsfw: createPostDto.isNsfw || false,
      visibility: createPostDto.visibility || 'public',
    });

    const savedPost = await this.postRepository.save(post);

    // Add media if provided
    if (mediaUrls && mediaUrls.length > 0) {
      const mediaRecords = mediaUrls.map((url, index) => {
        // Extract file type from URL (simplified)
        const mediaType = url.includes('.mp4') || url.includes('.webm') ? 'video' : 'image';
        return this.postMediaRepository.create({
          postId: savedPost.id,
          mediaUrl: url,
          publicId: `${savedPost.id}-${index}`, // Simplified; enhance with B2 publicId
          mediaType,
          displayOrder: index,
        });
      });

      await this.postMediaRepository.save(mediaRecords);
    }

    return this.getPostById(savedPost.id);
  }
}

