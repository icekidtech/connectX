import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsArray, Min, Max, IsInt, IsString } from 'class-validator';

export class GetRecommendationsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of recommendations per page',
    example: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Minimum age filter',
    example: 18,
    minimum: 18,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(18)
  ageMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum age filter',
    example: 65,
    maximum: 150,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Max(150)
  ageMax?: number;

  @ApiPropertyOptional({
    description: 'Maximum distance in kilometers',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDistance?: number;

  @ApiPropertyOptional({
    description: 'Gender filter',
    enum: ['male', 'female', 'non-binary'],
    example: 'female',
  })
  @IsOptional()
  genderFilter?: 'male' | 'female' | 'non-binary';

  @ApiPropertyOptional({
    description: 'Relationship type filter',
    example: ['dating', 'longterm'],
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  relationshipTypeFilter?: string[];
}
