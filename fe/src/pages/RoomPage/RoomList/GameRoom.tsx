import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { GameRoomProps } from '@/types/room';
import { FaCircle, FaCrown, FaUsers } from 'react-icons/fa6';

const GameRoom = ({ room }: GameRoomProps) => {
  return (
    <Card className="flex w-full mt-2">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{room.name}</CardTitle>
        </div>
        <div className="space-y-2 text-md text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            <FaCrown className="text-yellow-500" />
            <span>방장: {room.creator}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCircle
              className={`text-sm ${room.isGameStarted ? 'text-red-500' : 'text-green-500'}`}
            />
            <span>
              상태:{' '}
              <span
                className={
                  room.isGameStarted ? 'text-red-500' : 'text-green-500'
                }
              >
                {room.isGameStarted ? '게임 중' : '대기 중'}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="text-gray-500" />
            <span>인원 수: {room.players.length} / 4</span>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default GameRoom;
