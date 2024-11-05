import { Button } from '@/components/ui/button';
import { useState } from 'react';
import RoomDialog from '../RoomDialog/RoomDialog';

const RoomHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold">방 목록</span>
        <Button onClick={() => setIsDialogOpen(true)}>방 만들기</Button>
      </div>

      <RoomDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
};

export default RoomHeader;
