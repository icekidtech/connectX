import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsEnum, MaxLength, MinLength } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Updated post caption',
    example: 'Updated caption with more details',
    maxLength: 2500,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(2500)
  caption?: string;

  @ApiPropertyOptional({
    description: 'Updated hashtags',
    example: ['updated', 'newfocus'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({
    description: 'Update NSFW status',
    example: false,
  })
  @IsOptional()
  isNsfw?: boolean;

  @ApiPropertyOptional({
    description: 'Updated visibility level',
    enum: ['public', 'friends', 'private'],
    example: 'friends',
  })
  @IsOptional()
  @IsEnum(['public', 'friends', 'private'])
  visibility?: 'public' | 'friends' | 'private';
}
