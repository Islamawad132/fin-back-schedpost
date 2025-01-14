import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectStatus } from './dto/project.dto';
import { TeamRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) {}

  private defaultAISettings = {
    tone: 'Professional',
    contentLength: 'Medium',
    language: 'Arabic',
    autoGenerateHashtags: true,
    hashtagCount: 3
  };

  async create(userId: string, dto: CreateProjectDto) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        // دمج الإعدادات الافتراضية مع الإعدادات المدخلة (إن وجدت)
        const aiSettings = dto.aiSettings 
          ? { ...this.defaultAISettings, ...dto.aiSettings }
          : this.defaultAISettings;

        // Create the project
        const project = await prisma.project.create({
          data: {
            name: dto.name,
            description: dto.description,
            userId,
            aiSettings: JSON.parse(JSON.stringify(aiSettings))
          }
        });

        // Create default team for the project
        await prisma.team.create({
          data: {
            name: `${project.name} Team`,
            projectId: project.id,
            members: {
              create: {
                userId: userId,
                role: TeamRole.ADMIN
              }
            }
          }
        });

        // Add default AI key
        const defaultAIKey = this.configService.get('DEFAULT_AI_KEY');
        if (defaultAIKey) {
          await prisma.aIKey.create({
            data: {
              name: 'Default Google AI Key',
              apiKey: defaultAIKey,
              type: 'GOOGLE_AI',
              projectId: project.id
            }
          });
        }

        // Return project with its team and AI key
        return prisma.project.findUnique({
          where: { id: project.id },
          include: {
            teams: {
              include: {
                members: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                      }
                    }
                  }
                }
              }
            },
            aiKeys: true
          }
        });
      });
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { 
        userId,
        status: ProjectStatus.ACTIVE
      },
      include: {
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        userId: true,
        keywords: true,
        titles: true,
        aiSettings: true,
        createdAt: true,
        updatedAt: true,
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('المشروع غير موجود');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('غير مصرح لك بالوصول إلى هذا المشروع');
    }

    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    // Check if project exists and belongs to user
    const project = await this.findOne(userId, id);

    // إذا تم تقديم إعدادات جديدة، قم بدمجها مع الإعدادات الحالية
    let updatedAISettings = project.aiSettings as any;
    if (dto.aiSettings) {
      updatedAISettings = {
        ...this.defaultAISettings,
        ...updatedAISettings,
        ...dto.aiSettings
      };
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        aiSettings: updatedAISettings ? JSON.parse(JSON.stringify(updatedAISettings)) : undefined
      }
    });
  }

  async remove(userId: string, id: string) {
    // Check if project exists and belongs to user
    await this.findOne(userId, id);

    return this.prisma.project.delete({
      where: { id }
    });
  }

  async archive(userId: string, id: string) {
    // Check if project exists and belongs to user
    await this.findOne(userId, id);

    return this.prisma.project.update({
      where: { id },
      data: { status: 'archived' }
    });
  }

  async findArchived(userId: string) {
    return this.prisma.project.findMany({
      where: { 
        userId,
        status: ProjectStatus.ARCHIVED
      }
    });
  }

  async addKeywords(projectId: string, userId: string, keywords: string[]) {
    // التحقق من وجود المشروع وملكية المستخدم له
    const project = await this.findOne(userId, projectId);

    // إضافة الكلمات المفتاحية للمشروع
    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        keywords: {
          push: keywords // إضافة الكلمات الجديدة للمصفوفة الموجودة
        }
      },
      include: {
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // تسجيل النشاط
    await this.prisma.projectActivity.create({
      data: {
        projectId,
        userId,
        action: 'add_keywords',
        description: `تمت إضافة كلمات مفتاحية جديدة: ${keywords.join(', ')}`,
        metadata: { keywords }
      }
    });

    return updatedProject;
  }

  async removeKeywords(projectId: string, userId: string, keywords: string[]) {
    // التحقق من وجود المشروع وملكية المستخدم له
    const project = await this.findOne(userId, projectId);

    // إزالة الكلمات المفتاحية المحددة
    const updatedKeywords = (project.keywords || []).filter(
      keyword => !keywords.includes(keyword)
    );

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        keywords: updatedKeywords
      },
      include: {
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // تسجيل النشاط
    await this.prisma.projectActivity.create({
      data: {
        projectId,
        userId,
        action: 'remove_keywords',
        description: `تمت إزالة كلمات مفتاحية: ${keywords.join(', ')}`,
        metadata: { keywords }
      }
    });

    return updatedProject;
  }

  async addTitles(projectId: string, userId: string, titles: string[]) {
    // التحقق من وجود المشروع وملكية المستخدم له
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        titles: true
      }
    });

    if (!project) {
      throw new NotFoundException('المشروع غير موجود');
    }

    // الحصول على العناوين الحالية وإضافة العناوين الجديدة
    const currentTitles = project.titles || [];
    const updatedTitles = [...currentTitles, ...titles];

    // تحديث المشروع
    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        titles: updatedTitles
      },
      include: {
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // تسجيل النشاط
    await this.prisma.projectActivity.create({
      data: {
        projectId,
        userId,
        action: 'add_titles',
        description: `تمت إضافة عناوين جديدة: ${titles.join(', ')}`,
        metadata: { titles }
      }
    });

    return updatedProject;
  }

  async removeTitles(projectId: string, userId: string, titles: string[]) {
    // التحقق من وجود المشروع وملكية المستخدم له
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        titles: true
      }
    });

    if (!project) {
      throw new NotFoundException('المشروع غير موجود');
    }

    // إزالة العناوين المحددة
    const updatedTitles = (project.titles || []).filter(
      title => !titles.includes(title)
    );

    // تحديث المشروع
    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        titles: updatedTitles
      },
      include: {
        teams: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // تسجيل النشاط
    await this.prisma.projectActivity.create({
      data: {
        projectId,
        userId,
        action: 'remove_titles',
        description: `تمت إزالة عناوين: ${titles.join(', ')}`,
        metadata: { titles }
      }
    });

    return updatedProject;
  }
} 