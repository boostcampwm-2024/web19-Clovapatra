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

  const toggleMute = () => {
    if (volumeLevel > 0) {
      setVolumeLevel(0);
      if (peerId) {
        setVolume(peerId, 0);
      }
    } else {
      setVolumeLevel(50);
      if (peerId) {
        setVolume(peerId, volumeLevel / 100);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        className="hover:opacity-80 transition-opacity"
      >
        {volumeLevel > 0 ? (
          <HiSpeakerWave className="h-5 w-5 text-cyan-700" />
        ) : (
          <HiSpeakerXMark className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
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
