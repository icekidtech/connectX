import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('posts')
@ApiTags('Posts')
@ApiBearerAuth('JWT')
export class PostsController {
  constructor(private postsService: PostsService) {}

  /**
   * Get paginated feed of posts
   */
  @Get('feed')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get posts feed', description: 'Get paginated feed of posts' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Posts feed retrieved successfully' })
  async getFeed(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.postsService.getFeed(page, limit);
  }

  /**
   * Create a new post with optional media
   */
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create post', description: 'Create a new post with caption, hashtags, and optional media URLs' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid post data' })
  async createPost(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPostWithMedia(
      req.user.id,
      createPostDto,
      createPostDto.mediaUrls,
    );
  }

  /**
   * Get a single post by ID
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get post', description: 'Retrieve a single post by ID' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPost(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  /**
   * Update a post (caption, hashtags, visibility)
   * Only the author can update their post
   */
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Update post',
    description: 'Update post caption, hashtags, or visibility. Only post author can update.',
  })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 400, description: 'Unauthorized or invalid data' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(id, req.user.id, updatePostDto);
  }

  /**
   * Delete a post
   * Only the author can delete their post
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete post', description: 'Delete a post. Only post author can delete.' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 204, description: 'Post deleted successfully' })
  @ApiResponse({ status: 400, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(@Param('id') id: string, @Request() req: any) {
    return this.postsService.deletePost(id, req.user.id);
  }

  /**
   * Like or unlike a post
   * Toggle behavior: POST to like, subsequent POST to unlike
   */
  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Like/unlike post',
    description: 'Toggle like status on a post. Like if not already liked, unlike if already liked.',
  })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 200, description: 'Like status toggled' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async likePost(@Param('id') id: string, @Request() req: any) {
    return this.postsService.likePost(id, req.user.id);
  }

  /**
   * Get all likes on a post
   */
  @Get(':id/likes')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get post likes', description: 'Get paginated list of users who liked the post' })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Likes retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPostLikes(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getPostLikes(id, page, limit);
  }

  /**
   * Add a comment to a post
   */
  @Post(':id/comment')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add comment',
    description: 'Add a comment to a post. Can optionally reply to another comment.',
  })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid comment data' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async commentOnPost(
    @Param('id') id: string,
    @Request() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.postsService.commentOnPost(id, req.user.id, createCommentDto.content);
  }

  /**
   * Get all comments on a post (top-level only, excludes replies)
   */
  @Get(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get post comments',
    description: 'Get paginated list of top-level comments on a post (excludes nested replies)',
  })
  @ApiParam({ name: 'id', description: 'Post UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPostComments(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getPostComments(id, page, limit);
  }

  /**
   * Get nested replies to a comment
   */
  @Get('comment/:commentId/replies')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get comment replies', description: 'Get paginated list of replies to a comment' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async getCommentReplies(
    @Param('commentId') commentId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getCommentReplies(commentId, page, limit);
  }

  /**
   * Update a comment
   * Only the comment author can update
   */
  @Put('comment/:commentId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Update comment',
    description: 'Update comment text. Only comment author can update.',
  })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 400, description: 'Unauthorized or invalid data' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async updateComment(
    @Param('commentId') commentId: string,
    @Request() req: any,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.postsService.updateCommentText(commentId, req.user.id, updateCommentDto);
  }

  /**
   * Delete a comment
   * Only the author can delete their comment
   */
  @Delete('comment/:id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete comment',
    description: 'Delete a comment. Only comment author can delete.',
  })
  @ApiParam({ name: 'id', description: 'Comment UUID' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    return this.postsService.deleteComment(id, req.user.id);
  }

  /**
   * Like or unlike a comment
   * Toggle behavior
   */
  @Post('comment/:commentId/like')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Like/unlike comment',
    description: 'Toggle like status on a comment.',
  })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiResponse({ status: 200, description: 'Like status toggled' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async likeComment(
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.postsService.likeComment(commentId, req.user.id);
  }

  /**
   * Get all likes on a comment
   */
  @Get('comment/:commentId/likes')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get comment likes',
    description: 'Get paginated list of users who liked the comment',
  })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Likes retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async getCommentLikes(
    @Param('commentId') commentId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getCommentLikes(commentId, page, limit);
  }

  /**
   * Search posts by hashtag
   */
  @Get('hashtag/:hashtag')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Search posts by hashtag', description: 'Get posts containing a specific hashtag' })
  @ApiParam({ name: 'hashtag', description: 'Hashtag to search for (without #)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  async getHashtagPosts(
    @Param('hashtag') hashtag: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getHashtagPosts(hashtag, page, limit);
  }

  /**
   * Get all posts from a specific user
   */
  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get user posts', description: 'Get paginated posts from a specific user' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getUserPosts(userId, page, limit);
  }
}
