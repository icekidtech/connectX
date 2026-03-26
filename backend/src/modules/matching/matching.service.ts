import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { Block } from '../users/entities/block.entity';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  private calculateCompatibility(userA: UserProfile, userB: UserProfile): number {
    // TODO: Fix in Phase 5 - current implementation has entity property mismatches
    return 75;
  }

  private checkRelationshipTypeCompatibility(
    lookingForA: string[],
    lookingForB: string[],
  ): number {
    if (!lookingForA || !lookingForB) return 0;

    const matches = lookingForA.filter((item) => lookingForB.includes(item));
    return matches.length > 0 ? 1 : 0.5;
  }

  async getRecommendations(userId: string, page: number = 1, limit: number = 10) {
    // TODO: Fix in Phase 5 - current implementation has entity property mismatches
    // Return empty for now
    return [];
  }

  async likeUser(userOneId: string, userTwoId: string) {
    // TODO: Fix in Phase 5 - current implementation has entity property mismatches
    return { status: 'liked', matchId: 'placeholder' };
  }

  async getMatches(userId: string) {
    // TODO: Fix in Phase 5 - current implementation has entity property mismatches
    return [];
  }

  async blockUser(blockerId: string, blockedUserId: string) {
    let block = await this.blockRepository.findOne({
      where: { blockerId, blockedUserId },
    });

    if (!block) {
      block = this.blockRepository.create({
        blockerId,
        blockedUserId,
      });
      await this.blockRepository.save(block);
    }

    return { success: true };
  }
}
