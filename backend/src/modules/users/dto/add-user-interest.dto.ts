import { IsString } from 'class-validator';

export class AddUserInterestDto {
  @IsString()
  interestName: string;
}
