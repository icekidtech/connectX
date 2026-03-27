import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for a recommended match
 */
export class MatchResponseDto {
  @ApiProperty({
    description: 'User UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Sarah',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Johnson',
  })
  lastName: string;

  @ApiProperty({
    description: 'User profile photo URL',
    example: 'https://b2-bucket.backblazeb2.com/photo.jpg',
    nullable: true,
  })
  profilePhotoUrl?: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Adventure seeker, photography enthusiast',
  })
  bio?: string;

  @ApiProperty({
    description: 'User age',
    example: 28,
  })
  age?: number;

  @ApiProperty({
    description: 'User location',
    example: 'San Francisco, CA',
  })
  location?: string;

  @ApiProperty({
    description: 'Distance in kilometers',
    example: 15.5,
  })
  distance?: number;

  @ApiProperty({
    description: 'Compatibility score (0-100)',
    example: 82,
    minimum: 0,
    maximum: 100,
  })
  compatibilityScore: number;

  @ApiProperty({
    description: 'Common interests',
    example: ['travel', 'photography', 'hiking'],
    type: [String],
  })
  commonInterests: string[];

  @ApiProperty({
    description: 'Is user online',
    example: true,
  })
  isOnline?: boolean;

  @ApiProperty({
    description: 'Matching status',
    enum: ['recommended', 'liked', 'matched'],
    example: 'recommended',
  })
  status: string;
}
