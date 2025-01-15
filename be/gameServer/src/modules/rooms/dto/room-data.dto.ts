import { ApiProperty } from '@nestjs/swagger';
import { PlayerDataDto } from '../../players/dto/player-data.dto';
import { GameMode } from '../../games/dto/turn-data.dto';

export class RoomDataDto {
  @ApiProperty({
    example: '6f42377f-42ea-42cc-ac1a-b5d2b99d4ced',
    description: '게임 방 ID',
  })
  roomId: string;

  @ApiProperty({
    example: '게임방123',
    description: '게임 방 이름',
  })
  roomName: string;

  @ApiProperty({
    example: 'hostNickname123',
    description: '방을 생성한 사용자의 닉네임',
  })
  hostNickname: string;

  @ApiProperty({
    type: [PlayerDataDto],
    example: [
      {
        playerNickname: 'hostNic123',
        isReady: true,
        isMuted: false,
      },
      {
        playerNickname: 'player1',
        isReady: false,
        isMuted: true,
      },
    ],
    description: '현재 방에 참여한 플레이어 목록과 준비 상태',
  })
  players: PlayerDataDto[];

  @ApiProperty({
    example: 'waiting',
    description: '현재 방의 상태 (예: 대기 중, 게임 중)',
  })
  status: string;

  @ApiProperty({
    example: 4,
    description: '최대 플레이어 수',
  })
  maxPlayers: number;

  @ApiProperty({
    enum: GameMode,
    example: GameMode.RANDOM,
    description: '게임 모드',
  })
  gameMode: GameMode;

  @ApiProperty({
    example: 50,
    description: '랜덤 모드에서 클레오파트라 모드의 비율',
    required: false,
  })
  randomModeRatio?: number;
}
