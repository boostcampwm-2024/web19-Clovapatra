import { ApiProperty } from '@nestjs/swagger';

class ErrorDetails {
  @ApiProperty({
    description: '유효성 검사에서 실패한 대상 객체',
    type: Object,
    example: { roomName: '1234', hostNickname: '' },
  })
  target: object;

  @ApiProperty({
    description: '제공된 잘못된 값',
    type: String,
    example: '',
  })
  value: string;

  @ApiProperty({
    description: '유효성 검사에서 실패한 속성',
    type: String,
    example: 'hostNickname',
  })
  property: string;

  @ApiProperty({
    description: '유효성 검사 오류의 하위 항목 (있는 경우)',
    type: Array,
    example: [],
  })
  children: [];

  @ApiProperty({
    description: '실패한 유효성 검사에 대한 제약 조건',
    type: Object,
    example: {
      isNotEmpty: 'hostNickname은 필수 입력 항목입니다.',
      isLength: 'hostNickname은 2자에서 12자 사이여야 합니다.',
      matches: 'hostNickname은 한글, 알파벳, 숫자, 공백만 허용됩니다.',
    },
  })
  constraints: Record<string, string>;
}

export class ErrorResponse {
  @ApiProperty({
    description: '에러 메시지',
    example: 'Validation failed.',
  })
  message: string;

  @ApiProperty({
    description: '상세한 유효성 검사 오류',
    type: [ErrorDetails],
    example: [
      {
        target: { roomName: '1234', hostNickname: '' },
        value: '',
        property: 'hostNickname',
        children: [],
        constraints: {
          isNotEmpty: 'hostNickname은 필수 입력 항목입니다.',
          isLength: 'hostNickname은 2자에서 12자 사이여야 합니다.',
          matches: 'hostNickname은 한글, 알파벳, 숫자, 공백만 허용됩니다.',
        },
      },
    ],
    required: false,
  })
  details?: ErrorDetails[];
}
