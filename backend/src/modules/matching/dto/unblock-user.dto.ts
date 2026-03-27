import { ApiProperty } from '@nestjs/swagger';

/**
 * Empty DTO for unblocking a user.
 */
export class UnblockUserDto {
  @ApiProperty({
    description: 'This endpoint unblocks a previously blocked user.',
    example: 'No request body required',
  })
  example?: string;
}
