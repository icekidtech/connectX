import { IsOptional, IsNumber, IsString, Min, Max, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsNumber()
  @Min(18)
  @ApiPropertyOptional({ description: 'Minimum age preference', example: 18 })
  minAge?: number;

  @IsOptional()
  @IsNumber()
  @Max(120)
  @ApiPropertyOptional({ description: 'Maximum age preference', example: 60 })
  maxAge?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @ApiPropertyOptional({ description: 'Maximum distance in kilometers', example: 50 })
  maxDistance?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ description: 'Looking for relationship types', example: ['casual', 'serious'] })
  relationshipTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiPropertyOptional({ description: 'Preferred genders', example: ['female', 'other'] })
  preferredGenders?: string[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'What you are looking for' })
  lookingFor?: string;
}
