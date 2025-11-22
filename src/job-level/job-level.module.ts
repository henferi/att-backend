import { Module } from '@nestjs/common';
import { JobLevelController } from './job-level.controller';
import { JobLevelService } from './job-level.service';

@Module({
  controllers: [JobLevelController],
  providers: [JobLevelService],
})
export class JobLevelModule {}
