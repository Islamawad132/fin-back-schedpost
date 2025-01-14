import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService, 
    PrismaService,
    AIService,
    ConfigService
  ],
})
export class ProjectsModule {} 