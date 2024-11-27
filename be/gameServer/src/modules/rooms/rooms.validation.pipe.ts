import { Injectable, Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ErrorMessages } from '../../common/constant';

@Injectable()
export class RoomsValidationPipe extends ValidationPipe {
  private readonly logger = new Logger(RoomsValidationPipe.name);

  constructor() {
    super({
      exceptionFactory: (errors) => {
        if (errors.length > 0) {
          this.logger.warn(`Validation failed: ${errors}`);

          throw new WsException(ErrorMessages.VALIDATION_FAILED);
        }
      },
      transform: true, // 요청 데이터를 DTO로 변환
      whitelist: true, // DTO에 정의된 필드만 받도록 제한
      forbidNonWhitelisted: true, // 정의되지 않은 필드가 오면 에러
    });
  }
}
