import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModerationService } from './moderation.service';

@Controller('moderation')
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Post('report')
  @UseGuards(AuthGuard('jwt'))
  async createReport(@Body() reportData: any, @Request() req: any) {
    return this.moderationService.createReport({
      ...reportData,
      reporterId: req.user.id,
    });
  }

  @Get('reports')
  @UseGuards(AuthGuard('jwt'))
  async getPendingReports() {
    return this.moderationService.getPendingReports();
  }
}
