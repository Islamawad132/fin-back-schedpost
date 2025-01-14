import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  UseGuards
} from '@nestjs/common';
import { AIService } from './ai.service';
import { GenerateKeywordsDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiBody,
  ApiResponse,
  ApiParam 
} from '@nestjs/swagger';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('project/:projectId/keywords')
  @ApiOperation({ summary: 'توليد كلمات مفتاحية للمشروع' })
  @ApiParam({
    name: 'projectId',
    description: 'معرف المشروع',
    type: String
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        industry: {
          type: 'string',
          example: 'digital marketing',
          description: 'مجال المشروع'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'تم توليد الكلمات المفتاحية بنجاح',
    schema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          example: ['تسويق رقمي', 'سوشيال ميديا', 'تحسين محركات البحث']
        },
        usage: {
          type: 'object',
          example: {
            promptTokenCount: 45,
            candidatesTokenCount: 40,
            totalTokenCount: 85
          }
        }
      }
    }
  })
  generateKeywords(
    @Param('projectId') projectId: string,
    @Body() dto: GenerateKeywordsDto
  ) {
    return this.aiService.generateKeywords(projectId, dto.industry);
  }

  @Post('project/:projectId/titles')
  @ApiOperation({ summary: 'توليد عناوين باستخدام الكلمات المفتاحية' })
  @ApiParam({
    name: 'projectId',
    description: 'معرف المشروع',
    type: String
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          example: ['تسويق رقمي', 'سوشيال ميديا'],
          description: 'الكلمات المفتاحية المستخدمة لتوليد العناوين'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'تم توليد العناوين بنجاح',
    schema: {
      type: 'object',
      properties: {
        titles: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'أفضل 10 استراتيجيات للتسويق الرقمي في 2024',
            'كيف تبني حضورك القوي على منصات السوشيال ميديا',
            'دليلك الشامل لبدء حملتك التسويقية الرقمية'
          ]
        },
        usage: {
          type: 'object',
          example: {
            promptTokenCount: 55,
            candidatesTokenCount: 80,
            totalTokenCount: 135
          }
        }
      }
    }
  })
  generateTitles(
    @Param('projectId') projectId: string,
    @Body() data: { keywords: string[] }
  ) {
    return this.aiService.generatePostTitles(projectId, data.keywords);
  }
} 