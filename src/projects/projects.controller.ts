import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiResponse,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء مشروع جديد' })
  create(@CurrentUser() user: any, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'الحصول على جميع المشاريع النشطة للمستخدم',
    description: 'يقوم بإرجاع جميع المشاريع النشطة (غير المؤرشفة) للمستخدم الحالي'
  })
  findAll(@CurrentUser() user: any) {
    return this.projectsService.findAll(user.id);
  }

  @Get('archived')
  @ApiOperation({ 
    summary: 'الحصول على المشاريع المؤرشفة',
    description: 'يقوم بإرجاع جميع المشاريع المؤرشفة للمستخدم الحالي'
  })
  findArchived(@CurrentUser() user: any) {
    return this.projectsService.findArchived(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'الحصول على مشروع محدد' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تحديث مشروع' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف مشروع' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.remove(user.id, id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'أرشفة مشروع' })
  archive(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.archive(user.id, id);
  }

  @Post(':id/keywords')
  @ApiOperation({ summary: 'إضافة كلمات مفتاحية للمشروع' })
  @ApiParam({
    name: 'id',
    description: 'معرف المشروع',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          example: ['تسويق رقمي', 'سوشيال ميديا', 'تحسين محركات البحث']
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'تم إضافة الكلمات المفتاحية بنجاح',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'مشروع التسويق الرقمي' },
        keywords: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['تسويق رقمي', 'سوشيال ميديا', 'تحسين محركات البحث']
        },
        createdAt: { type: 'string', example: '2024-01-09T12:00:00Z' },
        updatedAt: { type: 'string', example: '2024-01-09T12:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'خطأ في البيانات المدخلة',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'البيانات غير صحيحة' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع غير موجود',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'المشروع غير موجود' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  addKeywords(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { keywords: string[] }
  ) {
    return this.projectsService.addKeywords(id, user.id, data.keywords);
  }

  @Delete(':id/keywords')
  @ApiOperation({ summary: 'إزالة كلمات مفتاحية من المشروع' })
  @ApiParam({
    name: 'id',
    description: 'معرف المشروع',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          example: ['تسويق رقمي', 'سوشيال ميديا']
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'تم إزالة الكلمات المفتاحية بنجاح',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'مشروع التسويق الرقمي' },
        keywords: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['تحسين محركات البحث']  // الكلمات المتبقية بعد الحذف
        },
        createdAt: { type: 'string', example: '2024-01-09T12:00:00Z' },
        updatedAt: { type: 'string', example: '2024-01-09T12:00:00Z' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'خطأ في البيانات المدخلة',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'البيانات غير صحيحة' },
        error: { type: 'string', example: 'Bad Request' },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'المشروع غير موجود',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'المشروع غير موجود' },
        error: { type: 'string', example: 'Not Found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  removeKeywords(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { keywords: string[] }
  ) {
    return this.projectsService.removeKeywords(id, user.id, data.keywords);
  }

  @Post(':id/titles')
  @ApiOperation({ summary: 'إضافة عناوين للمشروع' })
  @ApiParam({
    name: 'id',
    description: 'معرف المشروع',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titles: {
          type: 'array',
          items: { type: 'string' },
          example: ['أفضل 10 نصائح للتسويق الرقمي', 'كيف تزيد متابعيك على السوشيال ميديا']
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'تم إضافة العناوين بنجاح',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'مشروع التسويق الرقمي' },
        titles: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['أفضل 10 نصائح للتسويق الرقمي', 'كيف تزيد متابعيك على السوشيال ميديا']
        },
        createdAt: { type: 'string', example: '2024-01-09T12:00:00Z' },
        updatedAt: { type: 'string', example: '2024-01-09T12:00:00Z' }
      }
    }
  })
  addTitles(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { titles: string[] }
  ) {
    return this.projectsService.addTitles(id, user.id, data.titles);
  }

  @Delete(':id/titles')
  @ApiOperation({ summary: 'إزالة عناوين من المشروع' })
  @ApiParam({
    name: 'id',
    description: 'معرف المشروع',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        titles: {
          type: 'array',
          items: { type: 'string' },
          example: ['أفضل 10 نصائح للتسويق الرقمي']
        }
      }
    }
  })
  removeTitles(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { titles: string[] }
  ) {
    return this.projectsService.removeTitles(id, user.id, data.titles);
  }
} 