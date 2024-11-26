import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';

// Custom IoAdapter with CORS options
class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: '*',
        methods: '*',
        credentials: true,
        transports: ['websocket', 'polling'],
      },
      allowEIO3: true,
    });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // HTTP CORS 설정
  app.enableCors({
    origin: '*', // 모든 도메인 허용
    methods: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
    credentials: true,
    maxAge: 86400, // 24시간
  });

  // WebSocket CORS 설정
  app.useWebSocketAdapter(new CustomIoAdapter(app));

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

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received 앱 종료시작');
    await app.close();
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received 앱 종료시작');
    await app.close();
  });

  process.on('SIGUSR2', async () => {
    console.log('SIGUSR2 received 앱 종료시작 (nodemon에서 재시작)');
    await app.close();
  }); //
}
bootstrap();
