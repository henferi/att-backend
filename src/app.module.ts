import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ConfigModule } from '@nestjs/config';
import { JobLevelModule } from './job-level/job-level.module';

@Module({
  imports: [AuthModule, UserModule, WorkspaceModule,JobLevelModule,ConfigModule.forRoot({
      isGlobal: true, // agar bisa dipakai di seluruh app tanpa import ulang
    })],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
