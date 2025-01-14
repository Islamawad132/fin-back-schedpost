import { IsEmail, IsString, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com', description: 'البريد الإلكتروني' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'كلمة المرور' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'محمد', description: 'الاسم الأول' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'أحمد', description: 'الاسم الأخير' })
  @IsString()
  lastName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'البريد الإلكتروني' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'كلمة المرور' })
  @IsString()
  password: string;

  @ApiProperty({ 
    example: true, 
    description: 'تذكرني',
    required: false,
    default: false 
  })
  @IsBoolean()
  rememberMe?: boolean;
}

export class VerifyEmailDto {
  @ApiProperty({
    example: '123456',
    description: 'رمز التحقق المرسل إلى البريد الإلكتروني'
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'البريد الإلكتروني المراد تأكيده'
  })
  @IsEmail()
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: '123456',
    description: 'رمز التحقق المرسل إلى البريد الإلكتروني'
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'البريد الإلكتروني'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'كلمة المرور الجديدة'
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
} 