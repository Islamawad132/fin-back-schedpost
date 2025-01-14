import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamRole } from '@prisma/client';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<TeamRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const teamId = request.params.teamId;

      if (!teamId) {
        return true;
      }

      const teamMember = await this.prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: user.id
          }
        }
      });

      if (!teamMember) {
        throw new ForbiddenException('أنت لست عضواً في هذا الفريق');
      }

      return requiredRoles.includes(teamMember.role);
    } catch (error) {
      throw new ForbiddenException('خطأ في التحقق من الصلاحيات');
    }
  }
} 