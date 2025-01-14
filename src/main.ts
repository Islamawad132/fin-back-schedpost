import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Global prefix should come BEFORE Swagger setup
  app.setGlobalPrefix('api');
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Team Management API')
    .setDescription('API documentation for team management system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  app.useGlobalInterceptors(new TransformInterceptor());
  
  await app.listen(process.env.PORT || 3000);
  
  // Log the API URLs
  const serverUrl = await app.getUrl();
  console.log(`Server is running on: ${serverUrl}`);
  console.log(`Swagger documentation is available at: ${serverUrl}/api`);
}
bootstrap();
