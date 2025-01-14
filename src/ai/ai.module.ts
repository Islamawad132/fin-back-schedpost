import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    PrismaService,
    ConfigService
  ],
  exports: [AIService]
})
export class AIModule {} 