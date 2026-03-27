import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { GetRecommendationsQueryDto } from './dto/get-recommendations-query.dto';

@Controller('matching')
@ApiTags('Matching')
@ApiBearerAuth('JWT')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  /**
   * Get personalized recommendations
   * Filters and scores users based on distance, age, interests, etc.
   */
  @Get('recommendations')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get recommendations',
    description: 'Get personalized match recommendations with compatibility scoring',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'ageMin', required: false, type: Number })
  @ApiQuery({ name: 'ageMax', required: false, type: Number })
  @ApiQuery({ name: 'maxDistance', required: false, type: Number })
  @ApiQuery({ name: 'genderFilter', required: false, enum: ['male', 'female', 'non-binary'] })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved' })
  async getRecommendations(
    @Request() req: any,
    @Query() queryDto: GetRecommendationsQueryDto,
  ) {
    return this.matchingService.getRecommendations(req.user.id, queryDto);
  }

  /**
   * Like a user (create match or update like status)
   * If mutual like, status becomes 'matched'
   */
  @Post(':targetId/like')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Like user',
    description:
      'Like a user. If they like you back, status becomes matched. If you already liked them, this unlikes.',
  })
  @ApiParam({ name: 'targetId', description: 'User UUID to like' })
  @ApiResponse({ status: 201, description: 'Like created or updated' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async likeUser(@Request() req: any, @Param('targetId') targetId: string) {
    return this.matchingService.likeUser(req.user.id, targetId);
  }

  /**
   * Unlike a user
   */
  @Delete(':targetId/like')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Unlike user',
    description: 'Remove like from a user',
  })
  @ApiParam({ name: 'targetId', description: 'User UUID to unlike' })
  @ApiResponse({ status: 204, description: 'Like removed' })
  @ApiResponse({ status: 404, description: 'Like not found' })
  async unlikeUser(@Request() req: any, @Param('targetId') targetId: string) {
    return this.matchingService.unlikeUser(req.user.id, targetId);
  }

  /**
   * Get all mutual matches
   */
  @Get('matches')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get matches',
    description: 'Get all mutual matches (both users have liked each other)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Matches retrieved' })
  async getMatches(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.matchingService.getMatches(req.user.id, page, limit);
  }

  /**
   * Block a user
   */
  @Post(':userId/block')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Block user',
    description: 'Block a user (prevents them from appearing in recommendations)',
  })
  @ApiParam({ name: 'userId', description: 'User UUID to block' })
  @ApiResponse({ status: 201, description: 'User blocked' })
  @ApiResponse({ status: 400, description: 'Invalid action' })
  async blockUser(@Request() req: any, @Param('userId') userId: string) {
    return this.matchingService.blockUser(req.user.id, userId);
  }

  /**
   * Unblock a user
   */
  @Delete(':userId/block')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Unblock user',
    description: 'Unblock a previously blocked user',
  })
  @ApiParam({ name: 'userId', description: 'User UUID to unblock' })
  @ApiResponse({ status: 204, description: 'User unblocked' })
  @ApiResponse({ status: 404, description: 'Block not found' })
  async unblockUser(@Request() req: any, @Param('userId') userId: string) {
    return this.matchingService.unblockUser(req.user.id, userId);
  }
}
