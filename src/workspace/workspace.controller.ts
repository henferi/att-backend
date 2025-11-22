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

interface AuthUser {
    userId: string;
    workspaceId: string;
}

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @Post()
    async create(@Body() dto: CreateWorkspaceDto, @Req() req: any) {
        const user = req.user as AuthUser;
        // user.userId = id user yang login
        return this.workspaceService.createWorkspace(dto.name, user.userId);
    }

    @Get()
    async findAll(@Req() req: any) {
        const user = req.user as AuthUser;
        // diasumsikan getAllWorkspaces mengembalikan semua workspace
        // yang user tersebut menjadi anggota (pakai WorkspaceUser)
        return this.workspaceService.getAllWorkspaces(user.userId);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateWorkspaceDto,
        @Req() req: any,
    ) {
        const user = req.user as AuthUser;
        return this.workspaceService.updateWorkspace(id, dto.name, user.userId);
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: any) {
        const user = req.user as AuthUser;
        return this.workspaceService.deleteWorkspace(id, user.userId);
    }

    @Post(':id/invite')
    async inviteUser(
        @Param('id') workspaceId: string,
        @Req() req: any,
        @Body() dto: InviteUserDto,
    ) {
        const user = req.user as AuthUser;
        return this.workspaceService.inviteUserToWorkspace(
            workspaceId,
            user.userId,   // requester
            dto.userId,    // target yang di-invite
            dto.role,
        );
    }

    @Delete(':workspaceId/users/:userId')
    async removeUserFromWorkspace(
        @Param('workspaceId') workspaceId: string,
        @Param('userId') targetUserId: string,
        @Req() req: any,
    ) {
        const user = req.user as AuthUser;

        return this.workspaceService.removeUserFromWorkspace(
            workspaceId,
            user.userId,    // requester
            targetUserId,   // target yang di-remove
        );
    }
}
