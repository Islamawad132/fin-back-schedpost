import { ApiProperty } from '@nestjs/swagger';
import { TeamRole } from '@prisma/client';
import { UserDto } from '../../common/dto/user.dto';

export class TeamMemberDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  teamId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ 
    enum: TeamRole,
    example: TeamRole.MEMBER 
  })
  role: TeamRole;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  lastActive: Date;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  updatedAt: Date;
}

export class TeamDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'فريق التطوير' })
  name: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  projectId: string;

  @ApiProperty({ type: [TeamMemberDto] })
  members: TeamMemberDto[];

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  updatedAt: Date;
}

export class InvitationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  teamId: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: TeamRole, example: TeamRole.MEMBER })
  role: TeamRole;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: '2024-01-14T13:44:22.835Z' })
  expiresAt: Date;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  updatedAt: Date;
}

export class AcceptInvitationResponseDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT token للمصادقة'
  })
  token: string;

  @ApiProperty({ type: TeamMemberDto })
  teamMember: TeamMemberDto;
} 