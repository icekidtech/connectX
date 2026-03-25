import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Get('recommendations')
  @UseGuards(AuthGuard('jwt'))
  async getRecommendations(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.matchingService.getRecommendations(req.user.id, page, limit);
  }

  @Post(':targetId/like')
  @UseGuards(AuthGuard('jwt'))
  async likeUser(@Request() req: any, @Param('targetId') targetId: string) {
    return this.matchingService.likeUser(req.user.id, targetId);
  }

  @Get('matches')
  @UseGuards(AuthGuard('jwt'))
  async getMatches(@Request() req: any) {
    return this.matchingService.getMatches(req.user.id);
  }

  @Post(':userId/block')
  @UseGuards(AuthGuard('jwt'))
  async blockUser(@Request() req: any, @Param('userId') userId: string) {
    return this.matchingService.blockUser(req.user.id, userId);
  }
}
