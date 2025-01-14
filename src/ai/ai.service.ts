import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AddAIKeyDto } from './dto/ai.dto';
import axios from 'axios';
import { AIGenerationSettingsDto } from '../common/dto/ai-settings.dto';

@Injectable()
export class AIService {
  private readonly apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models';
  private readonly apiKey: string;
  
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {
    this.apiKey = this.configService.get('GOOGLE_AI_KEY');
  }

  private cleanJsonResponse(text: string): string {
    // إزالة علامات markdown وأي نص إضافي
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    return jsonMatch[0];
  }

  async generateKeywords(projectId: string, industry: string) {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: `Generate 10 relevant keywords for a ${industry} business. 
                     Return ONLY a JSON array of strings without any additional text or formatting.
                     Example: ["keyword1", "keyword2", "keyword3"]`
            }]
          }]
        }
      );

      console.log('Raw AI Response:', response.data.candidates[0].content.parts[0].text);
      
      const generatedText = response.data.candidates[0].content.parts[0].text;
      const cleanedJson = this.cleanJsonResponse(generatedText);
      const keywords = JSON.parse(cleanedJson);

      return {
        keywords,
        usage: response.data.usageMetadata
      };
    } catch (error) {
      console.error('AI Generation Error:', error.response?.data || error);
      throw new BadRequestException('فشل في توليد الكلمات المفتاحية');
    }
  }

  async generatePostTitles(projectId: string, keywords: string[]) {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: `Generate 5 engaging social media post titles using these keywords: ${keywords.join(', ')}.
                     Return ONLY a JSON array of strings without any additional text or formatting.
                     Example: ["Title 1", "Title 2", "Title 3"]
                     Make them creative and attention-grabbing.`
            }]
          }]
        }
      );

      console.log('Raw AI Response:', response.data.candidates[0].content.parts[0].text);
      
      const generatedText = response.data.candidates[0].content.parts[0].text;
      const cleanedJson = this.cleanJsonResponse(generatedText);
      const titles = JSON.parse(cleanedJson);

      return {
        titles,
        usage: response.data.usageMetadata
      };
    } catch (error) {
      console.error('AI Generation Error:', error.response?.data || error);
      throw new BadRequestException('فشل في توليد العناوين');
    }
  }

  async generatePostContent(projectId: string, selectedTitle: string) {
    try {
      // الحصول على المشروع مع الإعدادات
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: {
          name: true,
          description: true,
          keywords: true,
          titles: true,
          aiSettings: true
        }
      });

      if (!project) {
        throw new NotFoundException('المشروع غير موجود');
      }

      // تحويل aiSettings من JSON إلى كائن AIGenerationSettingsDto
      const settings = project.aiSettings as Record<string, any>;
      if (!settings || 
          !settings.tone || 
          !settings.contentLength || 
          !settings.language || 
          typeof settings.autoGenerateHashtags !== 'boolean' || 
          typeof settings.hashtagCount !== 'number') {
        throw new BadRequestException('لم يتم تحديد إعدادات التوليد للمشروع بشكل صحيح');
      }

      const validatedSettings: AIGenerationSettingsDto = {
        tone: settings.tone,
        contentLength: settings.contentLength,
        language: settings.language,
        autoGenerateHashtags: settings.autoGenerateHashtags,
        hashtagCount: settings.hashtagCount
      };

      // بناء الـ prompt باستخدام إعدادات المشروع
      const prompt = `
        You are writing content for a project named "${project.name}".
        Project Description: ${project.description}
        Keywords: ${project.keywords.join(', ')}
        
        Generate a ${validatedSettings.contentLength} length post in ${validatedSettings.language} with a ${validatedSettings.tone} tone
        for this title: "${selectedTitle}"
        
        ${validatedSettings.autoGenerateHashtags ? `Also include ${validatedSettings.hashtagCount} relevant hashtags.` : ''}
        
        Return the content in the following JSON format:
        {
          "content": "The generated content here",
          "hashtags": ["tag1", "tag2"] // only if autoGenerateHashtags is true
        }
      `;

      const response = await axios.post(
        `${this.apiEndpoint}/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      const cleanedJson = this.cleanJsonResponse(generatedText);
      const result = JSON.parse(cleanedJson);

      return {
        content: result.content,
        hashtags: result.hashtags,
        usage: response.data.usageMetadata
      };
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new BadRequestException('فشل في توليد المحتوى');
    }
  }

  async addKey(projectId: string, dto: AddAIKeyDto) {
    // التحقق من وجود المشروع
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new NotFoundException('المشروع غير موجود');
    }

    return this.prisma.aIKey.create({
      data: {
        name: dto.name,
        apiKey: dto.apiKey,
        type: dto.type,
        projectId
      }
    });
  }

  async updateKey(projectId: string, keyId: string, dto: AddAIKeyDto) {
    const key = await this.prisma.aIKey.findFirst({
      where: { 
        id: keyId,
        projectId 
      }
    });

    if (!key) {
      throw new NotFoundException('مفتاح AI غير موجود');
    }

    return this.prisma.aIKey.update({
      where: { id: keyId },
      data: {
        name: dto.name,
        apiKey: dto.apiKey,
        type: dto.type
      }
    });
  }

  async deleteKey(projectId: string, keyId: string) {
    const key = await this.prisma.aIKey.findFirst({
      where: { 
        id: keyId,
        projectId 
      }
    });

    if (!key) {
      throw new NotFoundException('مفتاح AI غير موجود');
    }

    // التحقق من عدم حذف المفتاح الافتراضي
    const keysCount = await this.prisma.aIKey.count({
      where: { projectId }
    });

    if (keysCount === 1) {
      throw new BadRequestException('لا يمكن حذف المفتاح الوحيد للمشروع');
    }

    return this.prisma.aIKey.delete({
      where: { id: keyId }
    });
  }

  private async getProjectAIKey(projectId: string) {
    const aiKey = await this.prisma.aIKey.findFirst({
      where: { 
        projectId,
        type: 'GOOGLE_AI'
      }
    });

    if (!aiKey) {
      throw new BadRequestException('لم يتم العثور على مفتاح AI للمشروع');
    }

    return aiKey;
  }
} 