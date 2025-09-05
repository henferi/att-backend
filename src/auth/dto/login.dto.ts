import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier: string; // Bisa email ATAU nomor HP

  @IsString()
  password: string;
}
