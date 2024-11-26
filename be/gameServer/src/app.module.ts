import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { RoomsModule } from './modules/rooms/rooms.module';
import { GamesModule } from './modules/games/games.module';
import { VoiceServersModule } from './modules/voice-servers/voice-servers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    RoomsModule,
    GamesModule,
    VoiceServersModule,
  ],
})
export class AppModule {}
