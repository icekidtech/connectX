import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserPhoto } from './entities/user-photo.entity';
import { Interest } from './entities/interest.entity';
import { UserInterest } from './entities/user-interest.entity';
import { Block } from './entities/block.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, UserPhoto, Interest, UserInterest, Block]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
