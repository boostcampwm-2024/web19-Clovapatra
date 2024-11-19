import { Slider } from '@/components/ui/slider';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { useState } from 'react';
import { signalingSocket } from '@/services/signalingSocket';
import usePeerStore from '@/stores/zustand/usePeerStore';

interface VolumeBarProps {
  playerNickname: string;
}

const VolumeBar = ({ playerNickname }: VolumeBarProps) => {
  const [volume, setVolume] = useState(50);
  const userMappings = usePeerStore((state) => state.userMappings);
  const peerId = userMappings[playerNickname];

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);

    if (peerId) {
      signalingSocket.setVolume(peerId, newVolume / 100);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {volume > 0 ? (
        <HiSpeakerWave className="h-4 w-4" />
      ) : (
        <HiSpeakerXMark className="h-4 w-4 text-muted-foreground" />
      )}
      <Slider
        value={[volume]}
        max={100}
        step={1}
        className="w-24"
        onValueChange={handleVolumeChange}
      />
    </div>
  );
};

export default VolumeBar;
