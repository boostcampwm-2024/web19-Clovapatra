import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class JoinRoomDto {
  @IsString({ message: 'roomId는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'roomId는 필수 입력 항목입니다.' })
  @ApiProperty({
    example: '6f42377f-42ea-42cc-ac1a-b5d2b99d4ced',
    description: '게임 방 ID',
  })
  roomId: string;

  @IsString({ message: 'playerNickname은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'playerNickname은 필수 입력 항목입니다.' })
  @Length(2, 8, { message: 'playerNickname은 2자에서 8자 사이여야 합니다.' })
  @Matches(/^[a-zA-Z0-9가-힣 ]+$/, {
    message: 'playerNickname은 한글, 알파벳, 숫자, 공백만 허용됩니다.',
  })
  @ApiProperty({
    example: 'playerNickname123',
    description: '입장할 사용자의 닉네임',
  })
  playerNickname: string;
}
