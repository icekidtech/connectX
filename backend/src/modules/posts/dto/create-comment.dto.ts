import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment text content',
    example: 'Great photo! Love the composition.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({
    description: 'UUID of parent comment if this is a reply',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
