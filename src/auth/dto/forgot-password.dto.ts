// dto/forgot-password.dto.ts
import { IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString()
  identifier: string;
}
