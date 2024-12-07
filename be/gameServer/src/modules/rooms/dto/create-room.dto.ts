import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { GameMode } from '../../games/dto/turn-data.dto';

export class CreateRoomDto {
  @IsString({ message: 'roomName은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'roomName은 필수 입력 항목입니다.' })
  @Length(2, 12, { message: 'roomName은 2자에서 12자 사이여야 합니다.' })
  @ApiProperty({ example: '게임방123', description: 'Room name' })
  roomName: string;

  @IsString({ message: 'hostNickname은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'hostNickname은 필수 입력 항목입니다.' })
  @Length(2, 8, { message: 'hostNickname은 2자에서 8자 사이여야 합니다.' })
  @Matches(/^[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ ]+$/, {
    message: 'hostNickname은 한글, 알파벳, 숫자, 공백만 허용됩니다.',
  })
  @ApiProperty({
    example: 'Nickname',
    description: 'hostNickname',
  })
  hostNickname: string;

  @IsInt()
  @Min(2)
  @Max(10)
  @ApiProperty({
    example: 4,
    description: '최대 플레이어 수 (2-10명)',
  })
  maxPlayers: number;

  @IsEnum(GameMode)
  @ApiProperty({
    enum: GameMode,
    example: GameMode.RANDOM,
    description: '게임 모드',
  })
  gameMode: GameMode;

  @ValidateIf((o) => o.gameMode === GameMode.RANDOM)
  @IsNumber()
  @Min(1)
  @Max(99)
  @ApiProperty({
    example: 50,
    description: '랜덤 모드에서 클레오파트라 모드의 비율 (1-99%)',
    required: false,
  })
  randomModeRatio?: number;
}
