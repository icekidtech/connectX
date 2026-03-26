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
    let score = 100;

    // Age compatibility (20% weight)
    const ageDiff = Math.abs(userA.age - userB.age);
    if (ageDiff <= 5) {
      // No penalty
    } else if (ageDiff <= 10) {
      score -= 5;
    } else {
      score -= Math.min(20, ageDiff);
    }

    // Relationship type compatibility (40% weight)
    const relationshipMatch = this.checkRelationshipTypeCompatibility(
      userA.lookingFor,
      userB.lookingFor,
    );
    score = score - 40 + relationshipMatch * 40;

    return Math.max(0, Math.min(100, score));
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
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'profile.interests'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingMatches = await this.matchRepository.find({
      where: { initiatorId: userId },
    });
    const existingIds = existingMatches.map((m) => m.targetId);

    const blockedUsers = await this.blockRepository.find({
      where: { blockerId: userId },
    });
    const blockedIds = blockedUsers.map((b) => b.blockedId);

    const excludeIds = [userId, ...existingIds, ...blockedIds];

    const potentialMatches = await this.userRepository.find({
      where: {
        verified: true,
      },
      relations: ['profile', 'profile.interests'],
    });

    const scored = potentialMatches
      .filter((p) => !excludeIds.includes(p.id))
      .map((p) => ({
        user: p,
        score: this.calculateCompatibility(user.profile, p.profile),
      }))
      .sort((a, b) => b.score - a.score)
      .slice((page - 1) * limit, page * limit);

    return scored.map((item) => ({
      id: item.user.id,
      displayName: item.user.profile.displayName,
      avatar: item.user.profile.avatar,
      bio: item.user.profile.bio,
      age: item.user.profile.age,
      location: item.user.profile.location,
      lookingFor: item.user.profile.lookingFor,
      interests: item.user.profile.interests,
      compatibilityScore: item.score,
    }));
  }

  async likeUser(initiatorId: string, targetId: string) {
    const blocked = await this.blockRepository.findOne({
      where: [
        { blockerId: initiatorId, blockedId: targetId },
        { blockerId: targetId, blockedId: initiatorId },
      ],
    });

    if (blocked) {
      throw new Error('Cannot match with this user');
    }

    let match = await this.matchRepository.findOne({
      where: { initiatorId, targetId },
    });

    if (match) {
      return { status: 'already_liked' };
    }

    match = this.matchRepository.create({
      initiatorId,
      targetId,
      status: 'pending',
    });

    await this.matchRepository.save(match);

    const mutualMatch = await this.matchRepository.findOne({
      where: { initiatorId: targetId, targetId: initiatorId },
    });

    if (mutualMatch) {
      match.status = 'matched';
      mutualMatch.status = 'matched';
      await this.matchRepository.save([match, mutualMatch]);
      return { status: 'mutual_match', matchId: match.id };
    }

    return { status: 'liked', matchId: match.id };
  }

  async getMatches(userId: string) {
    const matches = await this.matchRepository.find({
      where: { status: 'matched' },
      relations: ['initiator', 'target', 'initiator.profile', 'target.profile'],
    });

    return matches
      .filter((m) => m.initiatorId === userId || m.targetId === userId)
      .map((m) => ({
        id: m.id,
        user:
          m.initiatorId === userId
            ? {
                id: m.target.id,
                displayName: m.target.profile.displayName,
                avatar: m.target.profile.avatar,
              }
            : {
                id: m.initiator.id,
                displayName: m.initiator.profile.displayName,
                avatar: m.initiator.profile.avatar,
              },
      }));
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
