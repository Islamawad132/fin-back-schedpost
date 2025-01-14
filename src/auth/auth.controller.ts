import { Controller, Post, Body, Get, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, VerifyEmailDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { 
  AuthResponseDto, 
  MeResponseDto, 
  ErrorResponseDto,
  SignupResponseDto,
  MessageResponseDto
} from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ 
    summary: 'تسجيل مستخدم جديد',
    description: 'تسجيل مستخدم جديد وإرسال رمز تأكيد البريد الإلكتروني'
  })
  @ApiCreatedResponse({ 
    description: 'تم إنشاء المستخدم بنجاح',
    type: SignupResponseDto 
  })
  @ApiBadRequestResponse({ 
    description: 'بيانات غير صالحة',
    type: ErrorResponseDto
  })
  @ApiConflictResponse({ 
    description: 'البريد الإلكتروني مسجل مسبقاً',
    type: ErrorResponseDto
  })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName
    );
  }

  @Post('verify-email')
  @ApiOperation({ 
    summary: 'تأكيد البريد الإلكتروني',
    description: 'تأكيد البريد الإلكتروني باستخدام الرمز المرسل والبريد الإلكتروني'
  })
  @ApiOkResponse({ 
    description: 'تم تأكيد البريد الإلكتروني بنجاح',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'رمز التحقق غير صالح أو البريد الإلكتروني غير صحيح',
    type: ErrorResponseDto
  })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.code, dto.email);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'تسجيل الدخول',
    description: 'تسجيل الدخول للحصول على token'
  })
  @ApiOkResponse({ 
    description: 'تم تسجيل الدخول بنجاح',
    type: AuthResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'بيانات الدخول غير صحيحة',
    type: ErrorResponseDto
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.rememberMe);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @ApiOperation({ 
    summary: 'تجديد الtoken',
    description: 'تجديد الtoken باستخدام refresh token'
  })
  @ApiOkResponse({ 
    description: 'تم تجديد الtoken بنجاح',
    type: AuthResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Refresh token غير صالح',
    type: ErrorResponseDto
  })
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ 
    summary: 'نسيت كلمة المرور',
    description: 'إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني'
  })
  @ApiOkResponse({ 
    description: 'تم إرسال رابط إعادة التعيين',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'البريد الإلكتروني غير مسجل',
    type: ErrorResponseDto
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ 
    summary: 'إعادة تعيين كلمة المرور',
    description: 'إعادة تعيين كلمة المرور باستخدام الرمز المرسل والبريد الإلكتروني'
  })
  @ApiOkResponse({ 
    description: 'تم تغيير كلمة المرور بنجاح',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية',
    type: ErrorResponseDto
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.code, dto.email, dto.newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'الحصول على بيانات المستخدم الحالي',
    description: 'الحصول على بيانات المستخدم المسجل دخوله حالياً'
  })
  @ApiOkResponse({ 
    description: 'تم جلب البيانات بنجاح',
    type: MeResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'غير مصرح',
    type: ErrorResponseDto
  })
  getMe(@CurrentUser() user: MeResponseDto) {
    return user;
  }
} 