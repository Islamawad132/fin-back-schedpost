import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { CreatePlatformDto } from './dto/platform.dto';

@Injectable()
export class PlatformsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async addPlatform(projectId: string, data: CreatePlatformDto) {
    // التحقق من وجود المشروع
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException('المشروع غير موجود');
    }

    // تشفير بيانات الاعتماد قبل التخزين
    const encryptedCredentials = this.encryptCredentials(data.credentials);

    return this.prisma.platform.create({
      data: {
        type: data.type,
        name: data.name,
        credentials: encryptedCredentials,
        projectId
      }
    });
  }

  private encryptCredentials(credentials: any) {
    // تنفيذ التشفير هنا
    // يمكن استخدام مكتبة مثل crypto-js
    return credentials;
  }

  private decryptCredentials(encryptedCredentials: any) {
    // فك التشفير
    return encryptedCredentials;
  }

  async findByProject(projectId: string) {
    return this.prisma.platform.findMany({
      where: { projectId }
    });
  }

  async remove(platformId: string) {
    const platform = await this.prisma.platform.findUnique({
      where: { id: platformId }
    });

    if (!platform) {
      throw new NotFoundException('المنصة غير موجودة');
    }

    return this.prisma.platform.delete({
      where: { id: platformId }
    });
  }
} 