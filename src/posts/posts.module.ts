import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';
import { PlatformsService } from '../platforms/platforms.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [PostsController],
  providers: [
    PostsService,
    PrismaService,
    AIService,
    PlatformsService,
    ConfigService
  ]
})
export class PostsModule {} 