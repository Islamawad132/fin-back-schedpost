import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlatformType } from '@prisma/client';

export class CreatePlatformDto {
  @ApiProperty({ 
    enum: PlatformType,
    example: PlatformType.FACEBOOK,
    description: 'نوع المنصة'
  })
  @IsEnum(PlatformType)
  type: PlatformType;

  @ApiProperty({ 
    example: 'صفحة الشركة على فيسبوك',
    description: 'اسم المنصة'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: { accessToken: 'token123', pageId: 'page123' },
    description: 'بيانات الاعتماد الخاصة بالمنصة'
  })
  @IsObject()
  credentials: Record<string, any>;
}

export class PlatformResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: PlatformType })
  type: PlatformType;

  @ApiProperty()
  name: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 