import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters } from '@nestjs/common';
import { WsExceptionsFilter } from '../../common/filters/ws-exceptions.filter';

const VOICE_SERVERS = 'voice-servers';

@WebSocketGateway({
  namespace: '/rooms',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
@UseFilters(WsExceptionsFilter)
export class VoiceServersGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(VoiceServersGateway.name);

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('registerVoiceServer')
  async handleregisterVoiceServer(@ConnectedSocket() client: Socket) {
    try {
      client.join(VOICE_SERVERS);
      this.logger.log(`Voice server registered: ${client.id}`);
    } catch (error) {
      this.logger.error(`Failed to register voice server: ${error.message}`);
      client.emit('error', 'Failed to register voice server');
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Voice server disconnected: ${client.id}`);
  }
}
