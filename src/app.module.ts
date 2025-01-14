import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamsModule } from './teams/teams.module';
import { PlatformsModule } from './platforms/platforms.module';
import { PostsModule } from './posts/posts.module';
import { AIModule } from './ai/ai.module';
import { PrismaService } from './prisma/prisma.service';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProjectsModule,
    TeamsModule,
    PlatformsModule,
    PostsModule,
    AIModule
  ],
  controllers: [],
  providers: [PrismaService, MailService],
})
export class AppModule {}
