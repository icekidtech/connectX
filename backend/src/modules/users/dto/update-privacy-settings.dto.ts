import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePrivacySettingsDto {
  @IsOptional()
  @IsBoolean()
  showOnline?: boolean;

  @IsOptional()
  @IsBoolean()
  allowMessages?: boolean;

  @IsOptional()
  @IsBoolean()
  allowSearch?: boolean;

  @IsOptional()
  @IsBoolean()
  showProfile?: boolean;

  @IsOptional()
  @IsBoolean()
  showPhotos?: boolean;

  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;
}
