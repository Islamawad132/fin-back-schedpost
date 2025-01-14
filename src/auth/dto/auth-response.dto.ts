import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'محمد' })
  firstName: string;

  @ApiProperty({ example: 'أحمد' })
  lastName: string;

  @ApiProperty({ example: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    type: UserDto,
    description: 'بيانات المستخدم'
  })
  user: UserDto;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token للمصادقة'
  })
  token: string;

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token للتجديد',
    required: false
  })
  refreshToken?: string;
}

export class SignupResponseDto {
  @ApiProperty({
    type: UserDto,
    description: 'بيانات المستخدم المسجل'
  })
  user: UserDto;

  @ApiProperty({
    example: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني',
    description: 'رسالة نجاح التسجيل'
  })
  message: string;
}

export class MessageResponseDto {
  @ApiProperty({
    example: 'تم تأكيد البريد الإلكتروني بنجاح',
    description: 'رسالة نجاح العملية'
  })
  message: string;
}

export class MeResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'محمد' })
  firstName: string;

  @ApiProperty({ example: 'أحمد' })
  lastName: string;

  @ApiProperty({ example: true })
  isEmailVerified: boolean;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-07T13:44:22.835Z' })
  updatedAt: Date;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ 
    example: 'البريد الإلكتروني مسجل مسبقاً',
    description: 'رسالة الخطأ'
  })
  message: string;

  @ApiProperty({ 
    example: 'Bad Request',
    description: 'نوع الخطأ'
  })
  error: string;
} 