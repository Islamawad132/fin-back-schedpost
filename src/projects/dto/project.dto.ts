import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived'
}

export class AIGenerationSettingsDto {
  @ApiProperty({ 
    enum: ['Professional', 'Casual', 'Friendly'],
    example: 'Professional',
    description: 'نبرة المحتوى الافتراضية'
  })
  @IsEnum(['Professional', 'Casual', 'Friendly'])
  tone: string;

  @ApiProperty({ 
    enum: ['Short', 'Medium', 'Long'],
    example: 'Medium',
    description: 'طول المحتوى الافتراضي'
  })
  @IsEnum(['Short', 'Medium', 'Long'])
  contentLength: string;

  @ApiProperty({ 
    example: 'Arabic',
    description: 'لغة المحتوى الافتراضية'
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
    description: 'عدد الهاشتاجات الافتراضي'
  })
  @IsNumber()
  hashtagCount: number;
}

export class CreateProjectDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: AIGenerationSettingsDto })
  @IsOptional()
  aiSettings?: AIGenerationSettingsDto;
}

export class UpdateProjectDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: AIGenerationSettingsDto, required: false })
  @IsOptional()
  aiSettings?: AIGenerationSettingsDto;
} 