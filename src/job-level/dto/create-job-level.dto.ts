import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobLevelDto {
    @IsNotEmpty()
    @IsString()
    name: string;
}
