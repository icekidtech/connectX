import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @ApiPropertyOptional({
    description: 'Post caption text',
    example: 'Just arrived at the beach! 🌊',
    maxLength: 2500,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2500)
  caption?: string;

  @ApiPropertyOptional({
    description: 'Hashtags for the post',
    example: ['travel', 'beachday', 'vacation'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({
    description: 'Whether the post contains NSFW content',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsOptional()
  isNsfw?: boolean = false;

  @ApiPropertyOptional({
    description: 'Post visibility level',
    enum: ['public', 'friends', 'private'],
    example: 'public',
    default: 'public',
  })
  @IsOptional()
  @IsEnum(['public', 'friends', 'private'])
  visibility?: 'public' | 'friends' | 'private' = 'public';

  @ApiPropertyOptional({
    description: 'Array of media URLs to attach to the post',
    type: [String],
    example: ['https://b2-bucket.backblaze.com/image1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
