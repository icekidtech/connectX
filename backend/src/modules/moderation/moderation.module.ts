import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { UserVerification } from './entities/user-verification.entity';
import { ModerationService } from './moderation.service';
import { ModerationController } from './moderation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Report, UserVerification])],
  providers: [ModerationService],
  controllers: [ModerationController],
})
export class ModerationModule {}
