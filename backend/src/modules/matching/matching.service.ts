import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Or } from 'typeorm';
import { Match } from './entities/match.entity';
import { User } from '../users/entities/user.entity';
import { UserProfile } from '../users/entities/user-profile.entity';
import { UserInterest } from '../users/entities/user-interest.entity';
import { Block } from '../users/entities/block.entity';
import { GetRecommendationsQueryDto } from './dto/get-recommendations-query.dto';
import { calculateCompatibilityScore, calculateDistance, filterUsersByCriteria, CompatibilityFactors } from './utils/matching.utils';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(UserInterest)
    private userInterestRepository: Repository<UserInterest>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  /**
   * Get personalized recommendations for a user
   * Filters by age, distance, gender, relationship type
   * Scores by compatibility and excludes blocked users, existing matches
   */
  async getRecommendations(
    userId: string,
    queryDto: GetRecommendationsQueryDto
  ) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    // Get current user with profile
    const currentUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'profile',
        'interests',
        'interests.interest',
        'blockedUsers',
        'blockedByUsers',
      ],
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const currentUserProfile = currentUser.profile;
    const currentUserLat = Number(currentUserProfile?.latitude ?? 0);
    const currentUserLon = Number(currentUserProfile?.longitude ?? 0);

    // Get all users except self
    const allUsers = await this.userRepository.find({
      where: { id: Not(userId), status: 'active' },
      relations: [
        'profile',
        'interests',
        'interests.interest',
        'photos',
      ],
    });

    // Filter out blocked users
    const blockedIds = [
      ...currentUser.blockedUsers.map((b) => b.blockedUserId),
      ...currentUser.blockedByUsers.map((b) => b.blockerId),
    ];

    let candidateUsers = allUsers.filter((u) => !blockedIds.includes(u.id));

    // Filter by query criteria
    const filteredUsers = candidateUsers.map((user) => ({
      ...user,
      distance:
        currentUserProfile && user.profile
          ? calculateDistance(
              currentUserLat,
              currentUserLon,
              Number(user.profile.latitude || 0),
              Number(user.profile.longitude || 0),
            )
          : 0,
    })).filter((user) => {
      // Age filter
      if (queryDto.ageMin) {
        if (!user.profile?.dateOfBirth) {
          return false;
        }

        const age = Math.floor((Date.now() - user.profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < queryDto.ageMin) return false;
      }

      if (queryDto.ageMax) {
        if (!user.profile?.dateOfBirth) {
          return false;
        }

        const age = Math.floor((Date.now() - user.profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age > queryDto.ageMax) return false;
      }

      // Distance filter
      if (queryDto.maxDistance && user.distance > queryDto.maxDistance) return false;

      // Gender filter
      if (queryDto.genderFilter) {
        if (!user.profile?.gender) {
          return false;
        }

        if (user.profile.gender !== queryDto.genderFilter) {
          return false;
        }
      }

      // Relationship type filter
      if (queryDto.relationshipTypeFilter && queryDto.relationshipTypeFilter.length > 0) {
        const preferences = user.profile?.lookingFor || [];
        const hasOverlap = queryDto.relationshipTypeFilter.some((type) =>
          preferences.includes(type)
        );
        if (!hasOverlap) return false;
      }

      return true;
    });

    // Exclude existing matches
    const existingMatches = await this.matchRepository.find({
      where: [
        { userOneId: userId },
        { userTwoId: userId },
      ],
    });
    const matchedUserIds = new Set(
      existingMatches.flatMap((m) => [m.userOneId, m.userTwoId]).filter((id) => id !== userId)
    );

    const recommendedUsers = filteredUsers.filter((u) => !matchedUserIds.has(u.id));

    // Score and sort
    const currentUserAge = currentUserProfile?.dateOfBirth
      ? Math.floor((Date.now() - currentUserProfile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 30;

    const scoredUsers = recommendedUsers.map((user) => {
      const userAge = currentUserAge;
      
      const targetAge = user.profile?.dateOfBirth
        ? Math.floor((Date.now() - user.profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 30;

      const commonInterestCount = currentUser.interests.filter((ci) =>
        user.interests.some((ui) => ui.interestId === ci.interestId)
      ).length;

      const score = calculateCompatibilityScore({
        distance: user.distance,
        userAge,
        targetAge,
        targetGender: user.profile?.gender || '',
        userGenderPreference: currentUserProfile?.preferences?.genderPreference?.[0] || 'any',
        commonInterestCount,
        userRelationshipTypes: currentUserProfile?.lookingFor || [],
        targetRelationshipTypes: user.profile?.lookingFor || [],
        targetIsOnline: false,
        maxDistance: queryDto.maxDistance || 100,
      });

      return { ...user, compatibilityScore: score };
    });

    // Sort by score DESC
    scoredUsers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Paginate
    const paginatedUsers = scoredUsers.slice(skip, skip + limit);

    const mappedUsers = paginatedUsers.map((user) => ({
      id: user.id,
      firstName: user.profile?.firstName || user.username,
      lastName: user.profile?.lastName || '',
      age: user.profile?.dateOfBirth
        ? Math.floor((Date.now() - user.profile.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0,
      bio: user.profile?.bio || '',
      location: user.profile?.location || 'Unknown location',
      distance: user.distance,
      profilePhotoUrl: user.photos?.[0]?.photoUrl,
      commonInterests: user.interests.filter((ci) =>
        currentUser.interests.some((ui) => ui.interestId === ci.interestId)
      ).map((i) => i.interest.name),
      compatibilityScore: Math.round(user.compatibilityScore),
      isOnline: false, // Simplified for Phase 2
      status: 'recommended',
    }));

    return {
      data: mappedUsers,
      page,
      limit,
      total: scoredUsers.length,
    };
  }

  /**
   * Like a user (create or update match record)
   * If both users like each other, status becomes 'matched'
   */
  async likeUser(userOneId: string, userTwoId: string) {
    if (userOneId === userTwoId) {
      throw new BadRequestException('Cannot like yourself');
    }

    // Verify target user exists
    const targetUser = await this.userRepository.findOne({
      where: { id: userTwoId },
    });

    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Check if already blocked
    const isBlocked = await this.blockRepository.findOne({
      where: { blockerId: userOneId, blockedUserId: userTwoId },
    });

    if (isBlocked) {
      throw new BadRequestException('Cannot like a user you have blocked');
    }

    // Look for existing match (in either direction)
    let match = await this.matchRepository.findOne({
      where: [
        { userOneId, userTwoId },
        { userOneId: userTwoId, userTwoId: userOneId },
      ],
    });

    if (match) {
      // Update existing match
      if (match.userOneId === userOneId) {
        match.userOneLiked = true;
      } else {
        match.userTwoLiked = true;
      }

      // Check for mutual like
      if (match.userOneLiked && match.userTwoLiked) {
        match.status = 'matched';
      }

      await this.matchRepository.save(match);
    } else {
      // Create new match
      match = this.matchRepository.create({
        userOneId,
        userTwoId,
        userOneLiked: true,
        userTwoLiked: false,
        status: 'liked',
        compatibilityScore: 0, // Will be calculated on retrieval
      });

      await this.matchRepository.save(match);
    }

    return {
      matchId: match.id,
      status: match.status,
      userOneLiked: match.userOneLiked,
      userTwoLiked: match.userTwoLiked,
    };
  }

  /**
   * Unlike a user (remove match or reset like flag)
   */
  async unlikeUser(userOneId: string, userTwoId: string) {
    const match = await this.matchRepository.findOne({
      where: [
        { userOneId, userTwoId },
        { userOneId: userTwoId, userTwoId: userOneId },
      ],
    });

    if (!match) {
      throw new NotFoundException('No match record found');
    }

    // Reset like flag
    if (match.userOneId === userOneId) {
      match.userOneLiked = false;
    } else {
      match.userTwoLiked = false;
    }

    // If both unlike, delete the match
    if (!match.userOneLiked && !match.userTwoLiked) {
      await this.matchRepository.delete(match.id);
    } else {
      // Otherwise update status back to unlike state
      match.status = 'liked';
      await this.matchRepository.save(match);
    }

    return { success: true };
  }

  /**
   * Get all mutual matches for a user (status = 'matched')
   */
  async getMatches(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const matches = await this.matchRepository.find({
      where: [
        { userOneId: userId, status: 'matched' },
        { userTwoId: userId, status: 'matched' },
      ],
      relations: ['userOne', 'userOne.profile', 'userTwo', 'userTwo.profile', 'userOne.photos', 'userTwo.photos'],
      skip,
      take: limit,
      order: { updatedAt: 'DESC' },
    });

    return matches.map((match) => {
      const otherUserId = match.userOneId === userId ? match.userTwoId : match.userOneId;
      const otherUser = match.userOneId === userId ? match.userTwo : match.userOne;

      return {
        matchId: match.id,
        userId: otherUserId,
        firstName: otherUser.profile.firstName,
        lastName: otherUser.profile.lastName,
        bio: otherUser.profile.bio,
        profilePhotoUrl: otherUser.photos?.[0]?.photoUrl,
        matchedAt: match.createdAt,
        lastInteractionAt: match.updatedAt,
      };
    });
  }

  /**
   * Get users the current user follows (liked users, including mutual matches)
   */
  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [followRows, total] = await this.matchRepository.findAndCount({
      where: [
        { userOneId: userId, userOneLiked: true },
        { userTwoId: userId, userTwoLiked: true },
      ],
      relations: [
        'userOne',
        'userOne.profile',
        'userOne.photos',
        'userTwo',
        'userTwo.profile',
        'userTwo.photos',
      ],
      skip,
      take: limit,
      order: { updatedAt: 'DESC' },
    });

    const data = followRows.map((row) => {
      const isCurrentUserOne = row.userOneId === userId;
      const followedUser = isCurrentUserOne ? row.userTwo : row.userOne;

      return {
        followId: row.id,
        userId: followedUser.id,
        firstName: followedUser.profile?.firstName || followedUser.username,
        lastName: followedUser.profile?.lastName || '',
        bio: followedUser.profile?.bio || '',
        location: followedUser.profile?.location || 'Unknown location',
        profilePhotoUrl: followedUser.photos?.[0]?.photoUrl || null,
        followedAt: row.updatedAt,
        status: row.status,
      };
    });

    return {
      data,
      page,
      limit,
      total,
    };
  }

  /**
   * Block a user (prevents them from appearing in recommendations and messaging)
   */
  async blockUser(blockerId: string, blockedUserId: string) {
    if (blockerId === blockedUserId) {
      throw new BadRequestException('Cannot block yourself');
    }

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

    // Remove any existing matches with this user
    const existingMatch = await this.matchRepository.findOne({
      where: [
        { userOneId: blockerId, userTwoId: blockedUserId },
        { userOneId: blockedUserId, userTwoId: blockerId },
      ],
    });

    if (existingMatch) {
      await this.matchRepository.delete(existingMatch.id);
    }

    return { success: true };
  }

  /**
   * Unblock a user
   */
  async unblockUser(blockerId: string, unblockedUserId: string) {
    const block = await this.blockRepository.findOne({
      where: { blockerId, blockedUserId: unblockedUserId },
    });

    if (!block) {
      throw new NotFoundException('Block record not found');
    }

    await this.blockRepository.delete(block.id);
    return { success: true };
  }
}
