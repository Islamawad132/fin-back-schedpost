import { IsString, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    example: 'Arabic',
    description: 'لغة المحتوى'
  })
  @IsString()
  language: string;

  @ApiProperty({ 
    example: true,
    description: 'توليد هاشتاجات تلقائياً'
  })
  @IsBoolean()
  autoGenerateHashtags: boolean;

  @ApiProperty({ 
    example: 3,
    description: 'عدد الهاشتاجات'
  })
  @IsNumber()
  hashtagCount: number;
} 