import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Req,
    Param,
    Patch,
    Delete,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteUserDto } from './dto/invite-user.dto';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) { }

    @Post()
    async create(@Body() dto: CreateWorkspaceDto, @Req() req: any) {
        const user = req.user as { sub: string };
        return this.workspaceService.createWorkspace(dto.name, user.sub);
    }

    @Get()
    async findAll(@Req() req: any) {
        const user = req.user as { sub: string };
        return this.workspaceService.getAllWorkspaces(user.sub);
    }
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateWorkspaceDto,
        @Req() req: any,
    ) {
        const user = req.user as { sub: string };
        return this.workspaceService.updateWorkspace(id, dto.name, user.sub);
    }
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: any) {
        const user = req.user as { sub: string };
        return this.workspaceService.deleteWorkspace(id, user.sub);
    }

    @Post(':id/invite')
    async inviteUser(
        @Param('id') workspaceId: string,
        @Req() req: any,
        @Body() dto: InviteUserDto,
    ) {
        const user = req.user as { sub: string };
        return this.workspaceService.inviteUserToWorkspace(
            workspaceId,
            user.sub,
            dto.userId,
            dto.role,
        );
    }
    @Delete(':workspaceId/users/:userId')
    async removeUserFromWorkspace(
        @Param('workspaceId') workspaceId: string,
        @Param('userId') targetUserId: string,
        @Req() req: any,
    ) {
        const user = req.user as { sub: string };

        return this.workspaceService.removeUserFromWorkspace(
            workspaceId,
            user.sub,         // requester
            targetUserId,     // target to remove
        );
    }
}
