import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { InviteMemberDto, TeamRole, AcceptInvitationDto } from './dto/team.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

export enum TeamError {
  TEAM_NOT_FOUND = 'الفريق غير موجود',
  NOT_TEAM_ADMIN = 'يجب أن تكون مسؤول الفريق لدعوة أعضاء جدد',
  CANNOT_ADD_ADMIN = 'لا يمكن إضافة مسؤول آخر للفريق',
  MEMBER_EXISTS = 'هذا المستخدم عضو بالفريق بالفعل',
  PENDING_INVITATION = 'هناك دعوة معلقة بالفعل لهذا البريد الإلكتروني',
  INVALID_INVITATION = 'رمز الدعوة غير صالح أو منتهي الصلاحية',
  EMAIL_EXISTS = 'هذا البريد الإلكتروني مسجل بالفعل',
  MEMBER_NOT_FOUND = 'العضو غير موجود',
  CANNOT_MODIFY_ADMIN = 'لا يمكن تغيير دور المسؤول'
}

@Injectable()
export class TeamsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private authService: AuthService
  ) {}

  private generateInvitationCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 characters code
  }

  async inviteMember(teamId: string, userId: string, dto: InviteMemberDto) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { 
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!team) {
      throw new NotFoundException(TeamError.TEAM_NOT_FOUND);
    }

    // التحقق منأن المستخدم الحالي هو Admin
    const currentMember = team.members.find(member => member.userId === userId);
    if (!currentMember || currentMember.role !== TeamRole.ADMIN) {
      throw new ForbiddenException(TeamError.NOT_TEAM_ADMIN);
    }

    // التحقق منأن الدور المطلوب ليس ADMIN
    if (dto.role === TeamRole.ADMIN) {
      throw new ForbiddenException(TeamError.CANNOT_ADD_ADMIN);
    }

    // Check if user is already a member
    const existingMember = await this.prisma.teamMember.findFirst({
      where: {
        team: { id: teamId },
        user: { email: dto.email }
      }
    });

    if (existingMember) {
      throw new ConflictException(TeamError.MEMBER_EXISTS);
    }

    // Check for pending invitation
    const pendingInvitation = await this.prisma.invitation.findFirst({
      where: {
        teamId,
        email: dto.email,
        status: 'PENDING'
      }
    });

    if (pendingInvitation) {
      throw new ConflictException(TeamError.PENDING_INVITATION);
    }

    // إنشاء كود الدعوة
    const invitationCode = this.generateInvitationCode();

    // Create invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        teamId,
        email: dto.email,
        role: dto.role,
        code: invitationCode, // نضيف الكود هنا
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      include: {
        team: true
      }
    });

    // Send invitation email with code
    await this.mailService.sendTeamInvitation(
      dto.email,
      invitation.team.name,
      invitationCode
    );

    // Log activity
    await this.prisma.teamActivity.create({
      data: {
        teamId,
        memberId: team.members.find(member => member.userId === userId).id,
        action: 'member_invitation',
        description: `قام بدعوة ${dto.email} للانضمام للفريق`,
        metadata: { role: dto.role }
      }
    });

    return invitation;
  }

  async acceptInvitation(dto: AcceptInvitationDto) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        code: dto.invitationCode,
        email: dto.email,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      },
      include: {
        team: true
      }
    });

    if (!invitation) {
      throw new NotFoundException(TeamError.INVALID_INVITATION);
    }

    // Check if user already exists
    let user = await this.prisma.user.findUnique({
      where: { email: invitation.email }
    });

    if (user) {
      throw new ConflictException(TeamError.EMAIL_EXISTS);
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    user = await this.prisma.user.create({
      data: {
        email: invitation.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        isEmailVerified: true // Since they came through invitation
      }
    });

    // Create team member
    const member = await this.prisma.teamMember.create({
      data: {
        teamId: invitation.teamId,
        userId: user.id,
        role: invitation.role
      }
    });

    // Update invitation status
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    });

    // Log activity
    await this.prisma.teamActivity.create({
      data: {
        teamId: invitation.teamId,
        memberId: member.id,
        action: 'member_joined',
        description: `انضم ${user.email} إلى الفريق`
      }
    });

    // Generate auth token
    const token = this.authService.generateToken(user);

    // Return user data with token
    delete user.password;
    return {
      user,
      token,
      teamMember: member
    };
  }

  async findTeamMembers(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!team) {
      throw new NotFoundException(TeamError.TEAM_NOT_FOUND);
    }

    return team.members;
  }

  async updateMemberRole(teamId: string, memberId: string, newRole: TeamRole) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { team: true }
    });

    if (!member) {
      throw new NotFoundException(TeamError.MEMBER_NOT_FOUND);
    }

    if (member.role === TeamRole.ADMIN) {
      throw new ForbiddenException(TeamError.CANNOT_MODIFY_ADMIN);
    }

    return this.prisma.teamMember.update({
      where: { id: memberId },
      data: { role: newRole }
    });
  }

  async removeMember(teamId: string, memberId: string) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { team: true }
    });

    if (!member) {
      throw new NotFoundException(TeamError.MEMBER_NOT_FOUND);
    }

    if (member.role === TeamRole.ADMIN) {
      throw new ForbiddenException(TeamError.CANNOT_MODIFY_ADMIN);
    }

    return this.prisma.teamMember.delete({
      where: { id: memberId }
    });
  }

  // ... Additional methods for updating roles, removing members, etc.
} 