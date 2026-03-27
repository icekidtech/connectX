import { IsOptional, IsNumber, IsString, Min, Max, IsArray } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsNumber()
  @Min(18)
  minAge?: number;

  @IsOptional()
  @IsNumber()
  @Max(120)
  maxAge?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDistance?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relationshipTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredGenders?: string[];

  @IsOptional()
  @IsString()
  lookingFor?: string;
}
