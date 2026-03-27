import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePrivacySettingsDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Show online status', example: true })
  showOnline?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Allow direct messages', example: true })
  allowMessages?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Allow profile in search results', example: true })
  allowSearch?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Show profile to others', example: true })
  showProfile?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Show photos to others', example: true })
  showPhotos?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Show email address', example: false })
  showEmail?: boolean;
}
