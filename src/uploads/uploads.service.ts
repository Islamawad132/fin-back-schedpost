import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  async updateUserAvatar(userId: string, file: Express.Multer.File) {
    if (!file.mimetype.includes('image')) {
      throw new BadRequestException('يجب أن يكون الملف صورة');
    }

    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    // تحديث المستخدم مع التحقق من وجود الصورة القديمة
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true }
    });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: `/${filePath}`
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // حذف الصورة القديمة إذا وجدت
    if (currentUser?.avatarUrl) {
      const oldPath = currentUser.avatarUrl.slice(1);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return user;
  }
} 