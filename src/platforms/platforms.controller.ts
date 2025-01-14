import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  Get, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto, PlatformResponseDto } from './dto/platform.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('Platforms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('platforms')
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Post('project/:projectId')
  @ApiOperation({ summary: 'إضافة منصة جديدة للمشروع' })
  @ApiResponse({ 
    status: 201, 
    description: 'تم إضافة المنصة بنجاح',
    type: PlatformResponseDto 
  })
  addPlatform(
    @Param('projectId') projectId: string,
    @Body() dto: CreatePlatformDto
  ) {
    return this.platformsService.addPlatform(projectId, dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'الحصول على منصات المشروع' })
  @ApiResponse({ 
    status: 200, 
    description: 'تم جلب المنصات بنجاح',
    type: [PlatformResponseDto] 
  })
  getProjectPlatforms(@Param('projectId') projectId: string) {
    return this.platformsService.findByProject(projectId);
  }

  @Delete(':platformId')
  @ApiOperation({ summary: 'حذف منصة' })
  removePlatform(@Param('platformId') platformId: string) {
    return this.platformsService.remove(platformId);
  }
} 