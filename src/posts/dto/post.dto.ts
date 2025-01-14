import { IsString, IsArray, IsOptional, IsDate, IsObject, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled'
}

interface AIContent {
  content: string;
  usage?: any;
}

export class CreatePostDto {
  @ApiProperty({ 
    example: 'أفضل 10 نصائح للتسويق الرقمي',
    description: 'عنوان المنشور'
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    example: 'محتوى المنشور...',
    description: 'محتوى المنشور'
  })
  @IsString()
  content: string | AIContent;

  @ApiProperty({ 
    example: ['تسويق', 'سوشيال ميديا'],
    description: 'الكلمات المفتاحية'
  })
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @ApiProperty({ 
    enum: PostStatus,
    required: false,
    description: 'حالة المنشور'
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiProperty({ 
    example: '2024-01-10T12:00:00Z',
    required: false,
    description: 'موعد النشر المجدول'
  })
  @IsOptional()
  @IsDate()
  publishDate?: Date;

  @ApiProperty({ 
    example: { imageUrl: 'https://...', hashtags: ['#marketing'] },
    required: false,
    description: 'بيانات إضافية خاصة بالمنصة'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AIGenerationSettingsDto {
  @ApiProperty({ 
    enum: ['Professional', 'Casual', 'Friendly'],
    example: 'Professional',
    description: 'نبرة المحتوى'
  })
  @IsEnum(['Professional', 'Casual', 'Friendly'])
  tone: string;

  @ApiProperty({ 
    enum: ['Short', 'Medium', 'Long'],
    example: 'Medium',
    description: 'طول المحتوى'
  })
  @IsEnum(['Short', 'Medium', 'Long'])
  contentLength: string;

  @ApiProperty({ 
    example: 'English',
    description: 'لغة المحتوى'
  })
  @IsString()
  language: string;

  @ApiProperty({ 
    example: true,
    description: 'توليد هاشتاجات تلقائياً'
  })
  @IsBoolean()
  @IsOptional()
  autoGenerateHashtags?: boolean;

  @ApiProperty({ 
    example: 3,
    description: 'عدد الهاشتاجات المطلوبة'
  })
  @IsNumber()
  @IsOptional()
  hashtagCount?: number;

  @ApiProperty({ 
    example: 'أفضل 10 نصائح للتسويق الرقمي',
    description: 'العنوان المختار للمحتوى'
  })
  @IsString()
  selectedTitle: string;
}

export class GenerateAIPostDto {
  @ApiProperty({ type: AIGenerationSettingsDto })
  @ValidateNested()
  @Type(() => AIGenerationSettingsDto)
  settings: AIGenerationSettingsDto;
} 