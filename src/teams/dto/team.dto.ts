import { IsString, IsEnum, IsEmail, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TeamRole as PrismaTeamRole } from '@prisma/client';

// إعادة تصدير نوع TeamRole من Prisma
export { TeamRole } from '@prisma/client';

export class CreateTeamDto {
  @ApiProperty({ example: 'فريق التطوير', description: 'اسم الفريق' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'project-123', description: 'معرف المشروع' })
  @IsUUID()
  projectId: string;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'user@example.com', description: 'البريد الإلكتروني للعضو' })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    enum: PrismaTeamRole,
    example: PrismaTeamRole.MEMBER,
    description: 'دور العضو في الفريق'
  })
  @IsEnum(PrismaTeamRole)
  role: PrismaTeamRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ 
    enum: PrismaTeamRole,
    example: PrismaTeamRole.EDITOR,
    description: 'الدور الجديد للعضو'
  })
  @IsEnum(PrismaTeamRole)
  role: PrismaTeamRole;
}

export class AcceptInvitationDto {
  @ApiProperty({ example: 'ABC123', description: 'رمز الدعوة' })
  @IsString()
  invitationCode: string;

  @ApiProperty({ example: 'user@example.com', description: 'البريد الإلكتروني' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'محمد' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'أحمد' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export { AcceptInvitationResponseDto } from './team-response.dto'; 