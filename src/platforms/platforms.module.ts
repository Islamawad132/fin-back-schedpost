import { Module } from '@nestjs/common';
import { PlatformsController } from './platforms.controller';
import { PlatformsService } from './platforms.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [PlatformsController],
  providers: [
    PlatformsService,
    PrismaService,
    ConfigService
  ],
  exports: [PlatformsService]
})
export class PlatformsModule {} 