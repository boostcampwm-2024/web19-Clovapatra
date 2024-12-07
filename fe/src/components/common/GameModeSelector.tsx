import { GameMode } from '@/types/roomTypes';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import RoomOptionsSlider from './RoomOptionsSlider';
import { forwardRef } from 'react';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  randomModeRatio: number;
  onModeChange: (mode: GameMode) => void;
  onRatioChange: (ratio: number) => void;
}

const GameModeSelector = forwardRef<HTMLDivElement, GameModeSelectorProps>(
  ({ selectedMode, randomModeRatio, onModeChange, onRatioChange }, ref) => {
    return (
      <div className="space-y-4" ref={ref}>
        <Label>게임 모드</Label>
        <div>
          <RadioGroup
            value={selectedMode}
            onValueChange={(value) => onModeChange(value as GameMode)}
            className="grid grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={GameMode.CLEOPATRA} />
              <Label>클레오파트라</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={GameMode.PRONUNCIATION} />
              <Label>발음 게임</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={GameMode.RANDOM} />
              <Label>랜덤</Label>
            </div>
          </RadioGroup>
        </div>

        {selectedMode === GameMode.RANDOM && (
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm">클레오파트라 {randomModeRatio}%</span>
              <span className="text-sm">
                발음 게임 {100 - randomModeRatio}%
              </span>
            </div>
            <RoomOptionsSlider
              label="게임 모드 비율"
              value={randomModeRatio}
              min={1}
              max={99}
              step={1}
              onChange={onRatioChange}
              formatValue={(v) => `${v}:${100 - v}`}
            />
          </div>
        )}
      </div>
    );
  }
);

GameModeSelector.displayName = 'GameModeSelector';

export default GameModeSelector;
