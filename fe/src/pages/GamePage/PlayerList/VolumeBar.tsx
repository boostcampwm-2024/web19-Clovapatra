import { Slider } from '@/components/ui/slider';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { useState } from 'react';
import usePeerStore from '@/stores/zustand/usePeerStore';
import { useAudioManager } from '@/hooks/useAudioManager';

interface VolumeBarProps {
  playerNickname: string;
}

const VolumeBar = ({ playerNickname }: VolumeBarProps) => {
  const [volumeLevel, setVolumeLevel] = useState(50);
  const userMappings = usePeerStore((state) => state.userMappings);
  const { setVolume } = useAudioManager();

  const peerId = userMappings[playerNickname];

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];

    setVolumeLevel(newVolume);

    if (peerId) {
      setVolume(peerId, newVolume / 100);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {volumeLevel > 0 ? (
        <HiSpeakerWave className="h-4 w-4" />
      ) : (
        <HiSpeakerXMark className="h-4 w-4 text-muted-foreground" />
      )}
      <Slider
        value={[volumeLevel]}
        max={100}
        step={1}
        className="w-24"
        onValueChange={handleVolumeChange}
      />
    </div>
  );
};

export default VolumeBar;
