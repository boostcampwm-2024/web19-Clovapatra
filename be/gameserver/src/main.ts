import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // 모든 도메인 허용
    methods: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
    maxAge: 86400, // 24시간
  });

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('GameServer API Document')
    .setDescription('GameServer API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('app.port'));
}
bootstrap();
