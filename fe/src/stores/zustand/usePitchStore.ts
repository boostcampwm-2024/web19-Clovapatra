import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PITCH_CONSTANTS } from '@/constants/pitch';

interface PitchStore {
  currentPitch: number; // 현재 주파수
  currentOpacity: number; // 현재 불투명도
  currentVolume: number; // 현재 목소리 크기 (0.0 ~ 1.0)
  lastUpdateTime: number; // 마지막 업데이트 시간
  updatePitch: (pitch: number, volume: number) => void; // 주파수와 볼륨 업데이트 함수
  resetPitch: () => void; // 상태 초기화 함수
}

// 음계에 따른 불투명도를 계산하는 함수
const calculateOpacity = (pitch: number): number => {
  // 음성이 없거나 매우 낮은 경우 최소값으로 설정
  if (!pitch || pitch < PITCH_CONSTANTS.MIN_FREQ) {
    return PITCH_CONSTANTS.MIN_OPACITY;
  }

  // 주파수 값을 0~1 범위로 정규화
  const normalizedPitch = Math.min(
    Math.max(
      (pitch - PITCH_CONSTANTS.MIN_FREQ) /
        (PITCH_CONSTANTS.MAX_FREQ - PITCH_CONSTANTS.MIN_FREQ),
      0
    ),
    1
  );

  // 정규화된 값을 불투명도 범위로 매핑 (비선형적으로)
  const opacity =
    PITCH_CONSTANTS.MIN_OPACITY +
    Math.pow(normalizedPitch, 0.3) * // 더 쉽게 불투명도 증가
      (PITCH_CONSTANTS.MAX_OPACITY - PITCH_CONSTANTS.MIN_OPACITY);

  return opacity;
};

const usePitchStore = create<PitchStore>()(
  devtools((set) => ({
    currentPitch: 0,
    currentOpacity: PITCH_CONSTANTS.MIN_OPACITY,
    currentVolume: 0,
    lastUpdateTime: Date.now(),

    /**
     * 주파수와 볼륨을 업데이트하는 함수
     * @param pitch 현재 주파수
     * @param volume 현재 볼륨
     */
    updatePitch: (pitch, volume) =>
      set(() => {
        // 새로운 불투명도 계산
        const newOpacity = calculateOpacity(pitch);

        // 볼륨값 정규화 (0.0 ~ 1.0 범위로 조정)
        const normalizedVolume = Math.min(Math.max(volume, 0), 1);

        return {
          currentPitch: pitch,
          currentOpacity: newOpacity,
          currentVolume: normalizedVolume,
          lastUpdateTime: Date.now(),
        };
      }),

    /**
     * 피치 상태를 초기화하는 함수
     */
    resetPitch: () =>
      set({
        currentPitch: 0,
        currentOpacity: PITCH_CONSTANTS.MIN_OPACITY,
        currentVolume: 0,
        lastUpdateTime: Date.now(),
      }),
  }))
);

export default usePitchStore;
