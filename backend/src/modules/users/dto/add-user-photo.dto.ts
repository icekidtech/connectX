import { IsString, IsOptional, IsNumber } from 'class-validator';

export class AddUserPhotoDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsNumber()
  isProfilePhoto?: boolean;
}
