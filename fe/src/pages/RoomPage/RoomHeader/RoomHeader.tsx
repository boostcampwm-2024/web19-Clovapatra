import { Button } from '@/components/ui/button';

const RoomHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-2xl font-bold">방 목록</span>
      <Button>방 만들기</Button>
    </div>
  );
};

export default RoomHeader;
