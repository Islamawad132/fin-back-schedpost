import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { PlatformsService } from '../platforms/platforms.service';
import { CreatePostDto, PostStatus, GenerateAIPostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
    private platformsService: PlatformsService,
  ) {}

  async createPost(projectId: string, platformId: string, data: CreatePostDto) {
    const content = typeof data.content === 'object' 
      ? data.content.content 
      : data.content;

    const aiUsage = typeof data.content === 'object' 
      ? data.content.usage 
      : undefined;

    // إنشاء منشور جديد
    const post = await this.prisma.post.create({
      data: {
        title: data.title,
        content,
        keywords: data.keywords,
        platformId,
        status: data.status || PostStatus.DRAFT,
        publishDate: data.publishDate,
        metadata: {
          ...data.metadata,
          aiUsage
        }
      }
    });

    return post;
  }

  async generateAIPost(
    projectId: string, 
    platformId: string, 
    dto: GenerateAIPostDto
  ) {
    // توليد المحتوى باستخدام AI مع الإعدادات المخصصة
    const aiResponse = await this.aiService.generatePostContent(
      projectId,
      dto.settings.selectedTitle
    );

    // إنشاء المنشور مع المحتوى المولد
    const post = await this.createPost(projectId, platformId, {
      title: dto.settings.selectedTitle,
      content: {
        content: aiResponse.content,
        usage: aiResponse.usage
      },
      keywords: [], // سيتم ملؤها من المشروع
      metadata: {
        hashtags: aiResponse.hashtags,
        generationSettings: dto.settings
      }
    });

    return post;
  }

  async publishPost(postId: string) {
    // نشر المحتوى على المنصة المحددة
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { platform: true }
    });

    // استخدام API المنصة المناسبة للنشر
    // ...

    return this.prisma.post.update({
      where: { id: postId },
      data: { status: PostStatus.PUBLISHED }
    });
  }

  async findByPlatform(platformId: string) {
    return this.prisma.post.findMany({
      where: { platformId },
      orderBy: { createdAt: 'desc' }
    });
  }
} 