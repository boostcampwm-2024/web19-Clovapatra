import { Module } from '@nestjs/common';
import { VoiceServersGateway } from './voice-servers.gateway';

@Module({
  imports: [],
  providers: [VoiceServersGateway],
  controllers: [],
})
export class VoiceServersModule {}
