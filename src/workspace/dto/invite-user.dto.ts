import { IsString } from 'class-validator';

export class InviteUserDto {
  @IsString()
  userId: string;

  @IsString()
  role: string;
}
