import { ApiProperty } from '@nestjs/swagger';

/**
 * Empty DTO for toggling comment like.
 * Like/unlike is determined by whether a PostLike record exists.
 * A POST request creates a like, a DELETE request removes it.
 */
export class CommentLikeDto {
  @ApiProperty({
    description: 'This endpoint toggles like status. POST to like, DELETE to unlike.',
    example: 'No request body required - action determined by HTTP method',
  })
  example?: string;
}
