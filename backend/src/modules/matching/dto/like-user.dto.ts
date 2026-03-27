import { ApiProperty } from '@nestjs/swagger';

/**
 * Empty DTO for liking a user.
 * Like/unlike is determined by whether a Match record exists.
 */
export class LikeUserDto {
  @ApiProperty({
    description: 'This endpoint toggles like status.',
    example: 'No request body required',
  })
  example?: string;
}
