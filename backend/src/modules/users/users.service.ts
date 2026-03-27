import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserPhoto } from './entities/user-photo.entity';
import { Interest } from './entities/interest.entity';
import { UserInterest } from './entities/user-interest.entity';
import { Block } from './entities/block.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';
import { AddUserPhotoDto } from './dto/add-user-photo.dto';
import { AddUserInterestDto } from './dto/add-user-interest.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserPhoto)
    private userPhotoRepository: Repository<UserPhoto>,
    @InjectRepository(Interest)
    private interestRepository: Repository<Interest>,
    @InjectRepository(UserInterest)
    private userInterestRepository: Repository<UserInterest>,
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  /**
   * Get current authenticated user
   */
  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'photos', 'interests'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Get user profile by ID (detailed view)
   */
  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'photos', 'interests', 'interests.interest'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUserProfile(user);
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile = user.profile;

    if (!profile) {
      profile = this.userProfileRepository.create({
        userId,
        firstName: updateProfileDto.firstName || '',
        lastName: updateProfileDto.lastName || '',
        dateOfBirth: new Date(),
        gender: '',
        location: '',
        latitude: 0,
        longitude: 0,
      });
    }

    // Update profile fields
    if (updateProfileDto.firstName) profile.firstName = updateProfileDto.firstName;
    if (updateProfileDto.lastName) profile.lastName = updateProfileDto.lastName;
    if (updateProfileDto.bio) profile.bio = updateProfileDto.bio;
    if (updateProfileDto.dateOfBirth) profile.dateOfBirth = updateProfileDto.dateOfBirth;
    if (updateProfileDto.gender) profile.gender = updateProfileDto.gender;
    if (updateProfileDto.location) profile.location = updateProfileDto.location;
    if (updateProfileDto.latitude) profile.latitude = parseFloat(updateProfileDto.latitude);
    if (updateProfileDto.longitude) profile.longitude = parseFloat(updateProfileDto.longitude);
    if (updateProfileDto.profession) profile.occupation = updateProfileDto.profession;
    if (updateProfileDto.education) profile.education = updateProfileDto.education;
    if (updateProfileDto.relationshipStatus) profile.relationshipStatus = updateProfileDto.relationshipStatus;

    await this.userProfileRepository.save(profile);

    return this.formatUserProfile(user);
  }

  /**
   * Update user matching preferences
   */
  async updateUserPreferences(userId: string, preferencesDto: UpdatePreferencesDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.profile) {
      throw new BadRequestException('User profile not found. Please complete profile first.');
    }

    const preferences = {
      minAge: preferencesDto.minAge || 18,
      maxAge: preferencesDto.maxAge || 99,
      maxDistance: preferencesDto.maxDistance || 50,
      genderPreference: preferencesDto.preferredGenders || [],
    };

    user.profile.preferences = preferences;
    user.profile.lookingFor = preferencesDto.relationshipTypes || [];

    await this.userProfileRepository.save(user.profile);

    return user.profile;
  }

  /**
   * Update user privacy settings
   */
  async updatePrivacySettings(userId: string, privacyDto: UpdatePrivacySettingsDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.privacySettings = {
      showOnline: privacyDto.showOnline ?? user.privacySettings?.showOnline ?? true,
      allowMessages: privacyDto.allowMessages ?? user.privacySettings?.allowMessages ?? true,
      allowSearch: privacyDto.allowSearch ?? user.privacySettings?.allowSearch ?? true,
    };

    await this.userRepository.save(user);

    return user.privacySettings;
  }

  /**
   * Add a photo to user's gallery
   */
  async addUserPhoto(userId: string, photoDto: AddUserPhotoDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const photo = this.userPhotoRepository.create({
      userId,
      photoUrl: photoDto.url,
      publicId: `user_${userId}_${Date.now()}`,
      isProfilePhoto: photoDto.isProfilePhoto || false,
      displayOrder: photoDto.displayOrder || 0,
      contentClassification: 'pending',
    });

    return await this.userPhotoRepository.save(photo);
  }

  /**
   * Remove a photo from user's gallery
   */
  async removeUserPhoto(userId: string, photoId: string) {
    const photo = await this.userPhotoRepository.findOne({
      where: { id: photoId, userId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.userPhotoRepository.remove(photo);

    return { message: 'Photo removed successfully' };
  }

  /**
   * Get all user photos
   */
  async getUserPhotos(userId: string) {
    return await this.userPhotoRepository.find({
      where: { userId },
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * Add interest to user
   */
  async addUserInterest(userId: string, interestDto: AddUserInterestDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find or create interest
    let interest = await this.interestRepository.findOne({
      where: { name: interestDto.interestName },
    });

    if (!interest) {
      interest = this.interestRepository.create({
        name: interestDto.interestName,
      });
      await this.interestRepository.save(interest);
    }

    // Check if user already has this interest
    const existingUserInterest = await this.userInterestRepository.findOne({
      where: { userId, interestId: interest.id },
    });

    if (existingUserInterest) {
      throw new BadRequestException('User already has this interest');
    }

    const userInterest = this.userInterestRepository.create({
      userId,
      interestId: interest.id,
    });

    await this.userInterestRepository.save(userInterest);

    return interest;
  }

  /**
   * Remove interest from user
   */
  async removeUserInterest(userId: string, interestId: string) {
    const userInterest = await this.userInterestRepository.findOne({
      where: { userId, interestId },
    });

    if (!userInterest) {
      throw new NotFoundException('Interest not found for user');
    }

    await this.userInterestRepository.remove(userInterest);

    return { message: 'Interest removed successfully' };
  }

  /**
   * Get all user interests
   */
  async getUserInterests(userId: string) {
    const userInterests = await this.userInterestRepository.find({
      where: { userId },
      relations: ['interest'],
    });

    return userInterests.map((ui) => ui.interest);
  }

  /**
   * Block a user
   */
  async blockUser(userId: string, userIdToBlock: string) {
    if (userId === userIdToBlock) {
      throw new BadRequestException('Cannot block yourself');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    const userToBlock = await this.userRepository.findOne({ where: { id: userIdToBlock } });

    if (!user || !userToBlock) {
      throw new NotFoundException('User not found');
    }

    // Check if already blocked
    const existingBlock = await this.blockRepository.findOne({
      where: { blockerId: userId, blockedUserId: userIdToBlock },
    });

    if (existingBlock) {
      throw new BadRequestException('User is already blocked');
    }

    const block = this.blockRepository.create({
      blockerId: userId,
      blockedUserId: userIdToBlock,
    });

    await this.blockRepository.save(block);

    return { message: 'User blocked successfully' };
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string, userIdToUnblock: string) {
    const block = await this.blockRepository.findOne({
      where: { blockerId: userId, blockedUserId: userIdToUnblock },
    });

    if (!block) {
      throw new NotFoundException('Block not found');
    }

    await this.blockRepository.remove(block);

    return { message: 'User unblocked successfully' };
  }

  /**
   * Get list of blocked users
   */
  async getBlockedUsers(userId: string) {
    const blocks = await this.blockRepository.find({
      where: { blockerId: userId },
      relations: ['blockedUser'],
    });

    return blocks.map((block) => this.sanitizeUser(block.blockedUser));
  }

  /**
   * Check if user is blocked
   */
  async isUserBlocked(userId: string, otherUserId: string): Promise<boolean> {
    const block = await this.blockRepository.findOne({
      where: { blockerId: userId, blockedUserId: otherUserId },
    });

    return !!block;
  }

  /**
   * Delete user (soft delete via status)
   */
  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'banned';
    await this.userRepository.save(user);

    return { message: 'User deleted successfully' };
  }

  /**
   * Helper: Remove sensitive data from user object
   */
  private sanitizeUser(user: User) {
    const { passwordHash, verificationToken, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Helper: Format user profile with all related data
   */
  private formatUserProfile(user: User) {
    return {
      ...this.sanitizeUser(user),
      profile: user.profile,
      photos: user.photos || [],
      interests: user.interests?.map((ui: any) => ui.interest) || [],
    };
  }
}
