import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits code
  }

  async signup(email: string, password: string, firstName: string, lastName: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });

    if (exists) {
      throw new ConflictException('البريد الإلكتروني مسجل مسبقاً');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = this.generateVerificationCode();

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerificationCode: verificationCode
      },
    });

    await this.mailService.sendVerificationEmail(email, verificationCode);

    delete user.password;
    delete user.emailVerificationCode;
    return {
      user,
      message: 'تم إرسال رمز التأكيد إلى بريدك الإلكتروني'
    };
  }

  async verifyEmail(code: string, email: string) {
    const user = await this.prisma.user.findFirst({
      where: { 
        email,
        emailVerificationCode: code
      }
    });

    if (!user) {
      throw new BadRequestException('رمز التحقق غير صالح أو البريد الإلكتروني غير صحيح');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null
      }
    });

    return { message: 'تم تأكيد البريد الإلكتروني بنجاح' };
  }

  async login(email: string, password: string, rememberMe: boolean = false) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('يرجى تأكيد بريدك الإلكتروني أولاً');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const tokens = this.generateToken(user, rememberMe);

    // If remember me is true, store the refresh token
    if (rememberMe && tokens.refreshToken) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken }
      });
    }

    delete user.password;
    delete user.refreshToken;
    
    return { 
      user, 
      token: tokens.accessToken,
      ...(tokens.refreshToken && { refreshToken: tokens.refreshToken })
    };
  }

  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits code
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException('البريد الإلكتروني غير مسجل');
    }

    const resetCode = this.generateResetCode();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetCode: resetCode,
        passwordResetExpires: resetExpires
      }
    });

    await this.mailService.sendPasswordResetEmail(email, resetCode);

    return { message: 'تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' };
  }

  async resetPassword(code: string, email: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        passwordResetCode: code,
        passwordResetExpires: { gt: new Date() }
      }
    });

    if (!user) {
      throw new BadRequestException('رمز إعادة التعيين غير صالح أو منتهي الصلاحية');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetExpires: null
      }
    });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  public generateToken(user: any, isLongLived: boolean = false): { accessToken: string, refreshToken?: string } {
    const payload = { email: user.email, sub: user.id };
    
    // Regular access token (24 hours)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '24h'
    });

    // If remember me is true, generate a refresh token (30 days)
    if (isLongLived) {
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '30d'
      });
      return { accessToken, refreshToken };
    }

    return { accessToken };
  }

  // Add new method to refresh token
  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);
      
      // Find user with this refresh token
      const user = await this.prisma.user.findFirst({
        where: { 
          id: payload.sub,
          refreshToken: refreshToken
        }
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateToken(user, true);

      // Update refresh token in database
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken }
      });

      delete user.password;
      delete user.refreshToken;

      return {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 