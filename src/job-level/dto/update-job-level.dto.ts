import { IsOptional, IsString } from 'class-validator';

export class UpdateJobLevelDto {
  @IsString()
  @IsOptional()
  name?: string;
}
