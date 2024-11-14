import { Button } from '@/components/ui/button';
import { useState } from 'react';
import RoomDialog from '../RoomDialog/CreateDialog';

const RoomHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold">방 목록</span>
        <Button onClick={handleDialogOpen}>방 만들기</Button>
      </div>

      <RoomDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
};

export default RoomHeader;
