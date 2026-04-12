import { IsOptional, IsString, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'User first name' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'User last name' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'User bio/about', maxLength: 500 })
  bio?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional({ description: 'Date of birth' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Gender',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  })
  gender?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'City/location' })
  location?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Latitude of location' })
  latitude?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Longitude of location' })
  longitude?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Profession/job title' })
  profession?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Education level or school' })
  education?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Relationship status' })
  relationshipStatus?: string;
}
