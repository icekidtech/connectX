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
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdatePrivacySettingsDto } from './dto/update-privacy-settings.dto';
import { AddUserPhotoDto } from './dto/add-user-photo.dto';
import { AddUserInterestDto } from './dto/add-user-interest.dto';
import {
  getCurrentUserMeResponseExample,
  getUserProfileResponseExample,
  updateProfileResponseExample,
  updatePreferencesResponseExample,
  updatePrivacySettingsResponseExample,
  deleteUserResponseExample,
  addPhotoResponseExample,
  getUserPhotosResponseExample,
  removePhotoResponseExample,
  addInterestResponseExample,
  getUserInterestsResponseExample,
  removeInterestResponseExample,
  blockUserResponseExample,
  unblockUserResponseExample,
  getBlockedUsersResponseExample,
  isUserBlockedResponseExample,
  notFoundErrorExample,
  unauthorizedErrorExample,
  badRequestErrorExample,
} from '../../docs/users.swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Get current authenticated user with full profile
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve full profile of authenticated user including photos and interests',
  })
  @ApiResponse({ status: 200, description: 'User profile data', schema: { example: getCurrentUserMeResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req: ExpressRequest & { user: any }) {
    return this.usersService.getCurrentUser(req.user.id);
  }

  /**
   * Get user profile by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get user profile by ID',
    description: 'Retrieve public profile of any user',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User profile data', schema: { example: getUserProfileResponseExample } })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  /**
   * Update user profile
   */
  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update profile information (bio, location, profession, etc)',
  })
  @ApiResponse({ status: 200, description: 'Profile updated', schema: { example: updateProfileResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Request() req: ExpressRequest & { user: any }, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateUserProfile(req.user.id, updateProfileDto);
  }

  /**
   * Update matching preferences
   */
  @Put('preferences')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update matching preferences',
    description: 'Set age range, distance, relationship types, and gender preferences',
  })
  @ApiResponse({ status: 200, description: 'Preferences updated', schema: { example: updatePreferencesResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePreferences(@Request() req: ExpressRequest & { user: any }, @Body() preferencesDto: UpdatePreferencesDto) {
    return this.usersService.updateUserPreferences(req.user.id, preferencesDto);
  }

  /**
   * Update privacy settings
   */
  @Put('privacy-settings')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update privacy settings',
    description: 'Configure visibility, messaging, and search preferences',
  })
  @ApiResponse({ status: 200, description: 'Privacy settings updated', schema: { example: updatePrivacySettingsResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePrivacySettings(@Request() req: ExpressRequest & { user: any }, @Body() privacyDto: UpdatePrivacySettingsDto) {
    return this.usersService.updatePrivacySettings(req.user.id, privacyDto);
  }

  /**
   * Delete user account (soft delete)
   */
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Permanently deactivate account (soft delete)',
  })
  @ApiResponse({ status: 200, description: 'Account deleted', schema: { example: deleteUserResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteUser(@Request() req: ExpressRequest & { user: any }) {
    return this.usersService.deleteUser(req.user.id);
  }

  /**
   * Add photo to user gallery
   */
  @Post('photos')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Add photo to gallery',
    description: 'Upload or add new photo to user gallery',
  })
  @ApiResponse({ status: 201, description: 'Photo added', schema: { example: addPhotoResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addPhoto(@Request() req: ExpressRequest & { user: any }, @Body() photoDto: AddUserPhotoDto) {
    return this.usersService.addUserPhoto(req.user.id, photoDto);
  }

  /**
   * Get all user photos
   */
  @Get(':id/photos')
  @ApiOperation({
    summary: 'Get user photos',
    description: 'Retrieve all photos in user gallery',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User photos', schema: { example: getUserPhotosResponseExample } })
  async getUserPhotos(@Param('id') id: string) {
    return this.usersService.getUserPhotos(id);
  }

  /**
   * Remove photo from user gallery
   */
  @Delete('photos/:photoId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete photo',
    description: 'Remove photo from gallery',
  })
  @ApiParam({ name: 'photoId', description: 'Photo ID' })
  @ApiResponse({ status: 200, description: 'Photo removed', schema: { example: removePhotoResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Photo not found' })
  async removePhoto(@Request() req: ExpressRequest & { user: any }, @Param('photoId') photoId: string) {
    return this.usersService.removeUserPhoto(req.user.id, photoId);
  }

  /**
   * Add interest to user
   */
  @Post('interests')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Add interest',
    description: 'Add new interest to user profile',
  })
  @ApiResponse({ status: 201, description: 'Interest added', schema: { example: addInterestResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addInterest(@Request() req: ExpressRequest & { user: any }, @Body() interestDto: AddUserInterestDto) {
    return this.usersService.addUserInterest(req.user.id, interestDto);
  }

  /**
   * Get all user interests
   */
  @Get(':id/interests')
  @ApiOperation({
    summary: 'Get user interests',
    description: 'Retrieve all interests for a user',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User interests', schema: { example: getUserInterestsResponseExample } })
  async getUserInterests(@Param('id') id: string) {
    return this.usersService.getUserInterests(id);
  }

  /**
   * Remove interest from user
   */
  @Delete('interests/:interestId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete interest',
    description: 'Remove interest from user profile',
  })
  @ApiParam({ name: 'interestId', description: 'Interest ID' })
  @ApiResponse({ status: 200, description: 'Interest removed', schema: { example: removeInterestResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  async removeInterest(@Request() req: ExpressRequest & { user: any }, @Param('interestId') interestId: string) {
    return this.usersService.removeUserInterest(req.user.id, interestId);
  }

  /**
   * Block a user
   */
  @Post('block/:userIdToBlock')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Block user',
    description: 'Block another user from contacting or viewing profile',
  })
  @ApiParam({ name: 'userIdToBlock', description: 'User ID to block' })
  @ApiResponse({ status: 201, description: 'User blocked', schema: { example: blockUserResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request (already blocked or self)' })
  async blockUser(@Request() req: ExpressRequest & { user: any }, @Param('userIdToBlock') userIdToBlock: string) {
    return this.usersService.blockUser(req.user.id, userIdToBlock);
  }

  /**
   * Unblock a user
   */
  @Delete('block/:userIdToUnblock')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unblock user',
    description: 'Unblock previously blocked user',
  })
  @ApiParam({ name: 'userIdToUnblock', description: 'User ID to unblock' })
  @ApiResponse({ status: 200, description: 'User unblocked', schema: { example: unblockUserResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Block not found' })
  async unblockUser(@Request() req: ExpressRequest & { user: any }, @Param('userIdToUnblock') userIdToUnblock: string) {
    return this.usersService.unblockUser(req.user.id, userIdToUnblock);
  }

  /**
   * Get list of blocked users
   */
  @Get('blocked/list')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get blocked users',
    description: 'Retrieve list of users you have blocked',
  })
  @ApiResponse({ status: 200, description: 'List of blocked users', schema: { example: getBlockedUsersResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBlockedUsers(@Request() req: ExpressRequest & { user: any }) {
    return this.usersService.getBlockedUsers(req.user.id);
  }

  /**
   * Check if user is blocked
   */
  @Get('block/check/:otherUserId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Check if user is blocked',
    description: 'Check if you have blocked another user',
  })
  @ApiParam({ name: 'otherUserId', description: 'User ID to check' })
  @ApiResponse({ status: 200, description: 'Block status', schema: { example: isUserBlockedResponseExample } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async isUserBlocked(@Request() req: ExpressRequest & { user: any }, @Param('otherUserId') otherUserId: string) {
    const isBlocked = await this.usersService.isUserBlocked(req.user.id, otherUserId);
    return { isBlocked };
  }
}
