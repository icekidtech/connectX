import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get('feed')
  @UseGuards(AuthGuard('jwt'))
  async getFeed(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.postsService.getFeed(page, limit);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createPost(
    @Request() req: any,
    @Body() body: { caption: string; hashtags?: string[]; isNsfw?: boolean },
  ) {
    return this.postsService.createPost(
      req.user.id,
      body.caption,
      body.hashtags || [],
      body.isNsfw || false,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getPost(@Param('id') id: string) {
    return this.postsService.getPostById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deletePost(@Param('id') id: string, @Request() req: any) {
    return this.postsService.deletePost(id, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async likePost(@Param('id') id: string, @Request() req: any) {
    return this.postsService.likePost(id, req.user.id);
  }

  @Get(':id/likes')
  @UseGuards(AuthGuard('jwt'))
  async getPostLikes(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getPostLikes(id, page, limit);
  }

  @Post(':id/comment')
  @UseGuards(AuthGuard('jwt'))
  async commentOnPost(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { content: string },
  ) {
    return this.postsService.commentOnPost(id, req.user.id, body.content);
  }

  @Get(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  async getPostComments(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getPostComments(id, page, limit);
  }

  @Delete('comment/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(@Param('id') id: string, @Request() req: any) {
    return this.postsService.deleteComment(id, req.user.id);
  }

  @Get('hashtag/:hashtag')
  @UseGuards(AuthGuard('jwt'))
  async getHashtagPosts(
    @Param('hashtag') hashtag: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getHashtagPosts(hashtag, page, limit);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.postsService.getUserPosts(userId, page, limit);
  }
}
