import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CreateDialog from '../RoomDialog/CreateDialog';

const RoomHeader = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <span className="font-galmuri text-3xl">방 목록</span>
        <Button className="font-galmuri border" onClick={handleDialogOpen}>
          방 만들기
        </Button>
      </div>

      <CreateDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
};

export default RoomHeader;
