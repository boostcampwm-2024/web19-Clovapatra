import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Room } from '@/types/roomTypes';
import { FaCircle, FaCrown, FaUsers } from 'react-icons/fa6';

interface GameRoomProps {
  room: Room;
  onJoinRoom: (roomId: string) => void;
}

const GameRoom = ({ room, onJoinRoom }: GameRoomProps) => {
  const isGameStarted = (status: string) => {
    return status === 'playing';
  };
  const isRoomFull = room.players.length >= 4;

  const handleRoomClick = () => {
    if (!isGameStarted(room.status) && !isRoomFull) {
      onJoinRoom(room.roomId);
    }
  };

  return (
    <Card
      className={`flex w-full mt-2 ${
        !isGameStarted(room.status) && !isRoomFull
          ? 'cursor-pointer hover:bg-gray-50'
          : 'opacity-70'
      }`}
      onClick={handleRoomClick}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{room.roomName}</CardTitle>
        </div>
        <div className="space-y-2 text-md text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            <FaCrown className="text-yellow-500" />
            <span>방장: {room.hostNickname}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCircle
              className={`text-sm ${isGameStarted(room.status) ? 'text-red-500' : 'text-green-500'}`}
            />
            <span>
              상태:{' '}
              <span
                className={
                  isGameStarted(room.status) ? 'text-red-500' : 'text-green-500'
                }
              >
                {isGameStarted(room.status) ? '게임 중' : '대기 중'}
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
