import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';
import { AddUserPhotoDto } from './dto/add-user-photo.dto';
import { AddUserInterestDto } from './dto/add-user-interest.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Get current authenticated user with full profile
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Request() req) {
    return this.usersService.getCurrentUser(req.user.id);
  }

  /**
   * Get user profile by ID
   */
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  /**
   * Update user profile
   */
  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateUserProfile(req.user.id, updateProfileDto);
  }

  /**
   * Update matching preferences
   */
  @Put('preferences')
  @UseGuards(AuthGuard('jwt'))
  async updatePreferences(@Request() req, @Body() preferencesDto: UpdatePreferencesDto) {
    return this.usersService.updateUserPreferences(req.user.id, preferencesDto);
  }

  /**
   * Update privacy settings
   */
  @Put('privacy-settings')
  @UseGuards(AuthGuard('jwt'))
  async updatePrivacySettings(@Request() req, @Body() privacyDto: UpdatePrivacySettingsDto) {
    return this.usersService.updatePrivacySettings(req.user.id, privacyDto);
  }

  /**
   * Delete user account (soft delete)
   */
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Request() req) {
    return this.usersService.deleteUser(req.user.id);
  }

  /**
   * Add photo to user gallery
   */
  @Post('photos')
  @UseGuards(AuthGuard('jwt'))
  async addPhoto(@Request() req, @Body() photoDto: AddUserPhotoDto) {
    return this.usersService.addUserPhoto(req.user.id, photoDto);
  }

  /**
   * Get all user photos
   */
  @Get(':id/photos')
  async getUserPhotos(@Param('id') id: string) {
    return this.usersService.getUserPhotos(id);
  }

  /**
   * Remove photo from user gallery
   */
  @Delete('photos/:photoId')
  @UseGuards(AuthGuard('jwt'))
  async removePhoto(@Request() req, @Param('photoId') photoId: string) {
    return this.usersService.removeUserPhoto(req.user.id, photoId);
  }

  /**
   * Add interest to user
   */
  @Post('interests')
  @UseGuards(AuthGuard('jwt'))
  async addInterest(@Request() req, @Body() interestDto: AddUserInterestDto) {
    return this.usersService.addUserInterest(req.user.id, interestDto);
  }

  /**
   * Get all user interests
   */
  @Get(':id/interests')
  async getUserInterests(@Param('id') id: string) {
    return this.usersService.getUserInterests(id);
  }

  /**
   * Remove interest from user
   */
  @Delete('interests/:interestId')
  @UseGuards(AuthGuard('jwt'))
  async removeInterest(@Request() req, @Param('interestId') interestId: string) {
    return this.usersService.removeUserInterest(req.user.id, interestId);
  }

  /**
   * Block a user
   */
  @Post('block/:userIdToBlock')
  @UseGuards(AuthGuard('jwt'))
  async blockUser(@Request() req, @Param('userIdToBlock') userIdToBlock: string) {
    return this.usersService.blockUser(req.user.id, userIdToBlock);
  }

  /**
   * Unblock a user
   */
  @Delete('block/:userIdToUnblock')
  @UseGuards(AuthGuard('jwt'))
  async unblockUser(@Request() req, @Param('userIdToUnblock') userIdToUnblock: string) {
    return this.usersService.unblockUser(req.user.id, userIdToUnblock);
  }

  /**
   * Get list of blocked users
   */
  @Get('blocked/list')
  @UseGuards(AuthGuard('jwt'))
  async getBlockedUsers(@Request() req) {
    return this.usersService.getBlockedUsers(req.user.id);
  }

  /**
   * Check if user is blocked
   */
  @Get('block/check/:otherUserId')
  @UseGuards(AuthGuard('jwt'))
  async isUserBlocked(@Request() req, @Param('otherUserId') otherUserId: string) {
    const isBlocked = await this.usersService.isUserBlocked(req.user.id, otherUserId);
    return { isBlocked };
  }
}
