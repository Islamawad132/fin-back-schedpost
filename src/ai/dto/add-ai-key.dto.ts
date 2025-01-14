import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddAIKeyDto {
  @ApiProperty({ 
    example: 'Google AI Studio Key',
    description: 'اسم المفتاح'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'AIzaSyBJf0D1dz9Vc...',
    description: 'مفتاح API'
  })
  @IsString()
  apiKey: string;

  @ApiProperty({ 
    example: 'GOOGLE_AI',
    description: 'نوع المفتاح'
  })
  @IsString()
  type: string;
} 