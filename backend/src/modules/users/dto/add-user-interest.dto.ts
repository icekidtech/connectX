import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddUserInterestDto {
  @IsString()
  @ApiProperty({ description: 'Interest name', example: 'hiking' })
  interestName: string;
}
