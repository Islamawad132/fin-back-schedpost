import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  Get, 
  Patch, 
  UseGuards 
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, GenerateAIPostDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('platform/:platformId')
  @ApiOperation({ summary: 'إنشاء منشور جديد' })
  createPost(
    @Param('platformId') platformId: string,
    @Body() dto: CreatePostDto
  ) {
    return this.postsService.createPost(platformId, platformId, dto);
  }

  @Post('platform/:platformId/generate')
  @ApiOperation({ summary: 'توليد منشور باستخدام AI' })
  generateAIPost(
    @Param('platformId') platformId: string,
    @Body() dto: GenerateAIPostDto
  ) {
    return this.postsService.generateAIPost(platformId, platformId, dto);
  }

  @Get('platform/:platformId')
  @ApiOperation({ summary: 'الحصول على منشورات المنصة' })
  getPlatformPosts(@Param('platformId') platformId: string) {
    return this.postsService.findByPlatform(platformId);
  }

  @Patch(':postId/publish')
  @ApiOperation({ summary: 'نشر المحتوى' })
  publishPost(@Param('postId') postId: string) {
    return this.postsService.publishPost(postId);
  }
} 