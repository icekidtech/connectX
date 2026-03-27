import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddUserPhotoDto {
  @IsString()
  @ApiProperty({ description: 'Photo URL', example: 'https://example.com/photo.jpg' })
  url: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Photo caption', example: 'Me at the beach' })
  caption?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ description: 'Display order in gallery', example: 0 })
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Set as profile photo', example: false })
  isProfilePhoto?: boolean;
}
