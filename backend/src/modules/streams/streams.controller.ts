import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StreamsService } from './streams.service';

@Controller('streams')
export class StreamsController {
  constructor(private streamsService: StreamsService) {}

  @Get('live')
  @UseGuards(AuthGuard('jwt'))
  async getLiveStreams(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.streamsService.getLiveStreams(page, limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getStream(@Param('id') id: string) {
    return this.streamsService.getStreamById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async startStream(
    @Request() req: any,
    @Body() body: { title: string; description?: string; isNsfw?: boolean },
  ) {
    return this.streamsService.startStream(
      req.user.id,
      body.title,
      body.description,
      body.isNsfw || false,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async endStream(@Param('id') id: string, @Request() req: any) {
    return this.streamsService.endStream(id, req.user.id);
  }

  @Post(':id/join')
  @UseGuards(AuthGuard('jwt'))
  async joinStream(@Param('id') id: string, @Request() req: any) {
    return this.streamsService.joinStream(id, req.user.id);
  }

  @Post(':id/leave')
  @UseGuards(AuthGuard('jwt'))
  async leaveStream(@Param('id') id: string, @Request() req: any) {
    return this.streamsService.leaveStream(id, req.user.id);
  }

  @Get(':id/viewers')
  @UseGuards(AuthGuard('jwt'))
  async getStreamViewers(@Param('id') id: string) {
    return this.streamsService.getStreamViewers(id);
  }

  @Get(':id/stats')
  @UseGuards(AuthGuard('jwt'))
  async getStreamStats(@Param('id') id: string) {
    return this.streamsService.getStreamStats(id);
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getBroadcasterStreams(@Param('userId') userId: string) {
    return this.streamsService.getBroadcasterStreams(userId);
  }
}
