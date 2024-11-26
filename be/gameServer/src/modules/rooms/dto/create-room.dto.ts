import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateRoomDto {
  @IsString({ message: 'roomName은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'roomName은 필수 입력 항목입니다.' })
  @ApiProperty({ example: '게임방123', description: 'Room name' })
  roomName: string;

  @IsString({ message: 'hostNickname은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'hostNickname은 필수 입력 항목입니다.' })
  @Length(2, 12, { message: 'hostNickname은 2자에서 12자 사이여야 합니다.' })
  @Matches(/^[a-zA-Z0-9가-힣 ]+$/, {
    message: 'hostNickname은 한글, 알파벳, 숫자, 공백만 허용됩니다.',
  })
  @ApiProperty({
    example: 'hostNickname123',
    description: 'hostNickname',
  })
  hostNickname: string;
}
