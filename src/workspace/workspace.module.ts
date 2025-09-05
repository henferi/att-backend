import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceService, PrismaClient],
})
export class WorkspaceModule {}
