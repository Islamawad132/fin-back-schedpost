import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  Get, 
  Delete, 
  Patch, 
  UseGuards 
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { InviteMemberDto, UpdateMemberRoleDto, TeamRole, AcceptInvitationDto, AcceptInvitationResponseDto } from './dto/team.dto';
import { TeamDto, TeamMemberDto, InvitationDto } from './dto/team-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamRolesGuard } from './guards/team-roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ErrorResponseDto } from '../auth/dto/auth-response.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiParam
} from '@nestjs/swagger';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post(':teamId/invite')
  @UseGuards(TeamRolesGuard)
  @Roles(TeamRole.ADMIN)
  @ApiOperation({ 
    summary: 'دعوة عضو جديد للفريق',
    description: 'دعوة عضو جديد للفريق عن طريق البريد الإلكتروني. يتطلب صلاحيات المسؤول.'
  })
  @ApiParam({
    name: 'teamId',
    description: 'معرف الفريق',
    type: String
  })
  @ApiCreatedResponse({ 
    description: 'تم إرسال الدعوة بنجاح',
    type: InvitationDto 
  })
  @ApiBadRequestResponse({ 
    description: 'بيانات غير صالحة',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'غير مصرح',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'ليس لديك صلاحية لدعوة أعضاء',
    type: ErrorResponseDto
  })
  @ApiConflictResponse({ 
    description: 'العضو موجود بالفعل أو لديه دعوة معلقة',
    type: ErrorResponseDto
  })
  inviteMember(
    @CurrentUser() user: any,
    @Param('teamId') teamId: string,
    @Body() dto: InviteMemberDto
  ) {
    return this.teamsService.inviteMember(teamId, user.id, dto);
  }

  @Post('invitations/accept')
  @ApiOperation({ 
    summary: 'قبول دعوة وإنشاء حساب',
    description: 'قبول دعوة الانضمام إلى فريق وإنشاء حساب جديد'
  })
  @ApiCreatedResponse({ 
    description: 'تم إنشاء الحساب وقبول الدعوة بنجاح',
    type: AcceptInvitationResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'بيانات غير صالحة',
    type: ErrorResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'الدعوة غير موجودة أو منتهية الصلاحية',
    type: ErrorResponseDto
  })
  @ApiConflictResponse({ 
    description: 'البريد الإلكتروني مسجل بالفعل',
    type: ErrorResponseDto
  })
  acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.teamsService.acceptInvitation(dto);
  }

  @Get(':teamId/members')
  @UseGuards(TeamRolesGuard)
  @Roles(TeamRole.ADMIN, TeamRole.EDITOR, TeamRole.MEMBER)
  @ApiOperation({ 
    summary: 'الحصول على أعضاء الفريق',
    description: 'الحصول على جميع أعضاء فريق معين'
  })
  @ApiCreatedResponse({ 
    description: 'تم جلب الأعضاء بنجاح',
    type: [TeamMemberDto]
  })
  @ApiUnauthorizedResponse({ 
    description: 'غير مصرح',
    type: ErrorResponseDto
  })
  @ApiNotFoundResponse({ 
    description: 'الفريق غير موجود',
    type: ErrorResponseDto
  })
  getTeamMembers(@Param('teamId') teamId: string) {
    return this.teamsService.findTeamMembers(teamId);
  }

  @Patch(':teamId/members/:memberId/role')
  @UseGuards(TeamRolesGuard)
  @Roles(TeamRole.ADMIN)
  @ApiOperation({ summary: 'تحديث دور عضو في الفريق' })
  updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto
  ) {
    return this.teamsService.updateMemberRole(teamId, memberId, dto.role);
  }

  @Delete(':teamId/members/:memberId')
  @UseGuards(TeamRolesGuard)
  @Roles(TeamRole.ADMIN)
  @ApiOperation({ summary: 'إزالة عضو من الفريق' })
  removeMember(
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string
  ) {
    return this.teamsService.removeMember(teamId, memberId);
  }
} 