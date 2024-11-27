import { Catch, ArgumentsHost } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

@Catch(WsException)
export class WsExceptionsFilter {
  private readonly logger = new Logger(WsExceptionsFilter.name);

  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    const errorResponse = exception.getError();

    client.emit('error', errorResponse);
  }
}
