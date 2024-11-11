import { Slider } from '@/components/ui/slider';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { useState } from 'react';

interface AudioControlProps {
  isOn: boolean;
}

const VolumeBar = ({ isOn }: AudioControlProps) => {
  const [volume, setVolume] = useState(50);

  return (
    <div className="flex items-center gap-2">
      {volume > 0 && isOn ? (
        <HiSpeakerWave className="h-4 w-4" />
      ) : (
        <HiSpeakerXMark className="h-4 w-4 text-muted-foreground" />
      )}
      <Slider
        value={[volume]}
        max={100}
        step={1}
        className="w-24"
        onValueChange={(value) => setVolume(value[0])}
      />
    </div>
  );
};

export default VolumeBar;
