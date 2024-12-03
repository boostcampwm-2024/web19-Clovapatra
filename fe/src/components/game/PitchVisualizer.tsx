import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '@/stores/zustand/useGameStore';
import useRoomStore from '@/stores/zustand/useRoomStore';
import usePitchStore from '@/stores/zustand/usePitchStore';
import { signalingSocket } from '@/services/signalingSocket';
import { PITCH_CONSTANTS } from '@/constants/pitch';
import { usePitchDetection } from '@/hooks/usePitchDetection';

interface PitchVisualizerProps {
  isGameplayPhase: boolean;
}

const PitchVisualizer = ({ isGameplayPhase }: PitchVisualizerProps) => {
  const { currentPlayer } = useRoomStore();
  const { turnData, rank } = useGameStore();
  const { currentOpacity, currentVolume, resetPitch } = usePitchStore();

  // 클레오파트라 모드 여부와 스트림 상태를 판단하여 피치 검출 훅 호출
  const isCleopatraMode = turnData?.gameMode === 'CLEOPATRA';
  const isActive = isCleopatraMode && rank.length === 0 && isGameplayPhase;

  // 스트림 가져오기
  let stream: MediaStream | null = null;
  if (isActive) {
    if (turnData.playerNickname === currentPlayer) {
      stream = signalingSocket.getLocalStream();
    } else {
      stream = signalingSocket.getPeerStream(turnData.playerNickname);
    }
  }

  // 피치 검출 훅 호출
  usePitchDetection(isCleopatraMode && isActive, stream);

  // 렌더링 조건 확인
  if (!isActive) {
    return null;
  }

  // 볼륨에 따른 스케일 계산
  const scale =
    PITCH_CONSTANTS.VISUALIZER_MIN_SCALE +
    currentVolume * PITCH_CONSTANTS.VISUALIZER_VOLUME_MULTIPLIER;

  // 스타일 정의
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 9999,
    // overflow: 'hidden',
  };

  const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: PITCH_CONSTANTS.CONTAINER_SIZE,
    height: PITCH_CONSTANTS.CONTAINER_SIZE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100vw',
    maxHeight: '100vh',
  };

  return (
    <div style={containerStyle}>
      <AnimatePresence>
        <motion.div
          key="pepe-container"
          style={imageContainerStyle}
          initial={{
            opacity: PITCH_CONSTANTS.MIN_OPACITY,
            scale: PITCH_CONSTANTS.VISUALIZER_MIN_SCALE,
          }}
          animate={{
            opacity: currentOpacity * PITCH_CONSTANTS.FREQ_MULTIPLIER,
            scale: Math.min(scale, PITCH_CONSTANTS.VISUALIZER_MAX_SCALE),
          }}
          exit={{
            opacity: PITCH_CONSTANTS.MIN_OPACITY,
            scale: PITCH_CONSTANTS.VISUALIZER_MIN_SCALE,
          }}
          transition={{
            opacity: {
              duration: PITCH_CONSTANTS.OPACITY_TRANSITION_DURATION,
              ease: 'linear',
            },
            scale: {
              type: 'spring',
              stiffness: 700,
              damping: 30,
              mass: 1,
              duration: PITCH_CONSTANTS.SCALE_TRANSITION_DURATION,
            },
          }}
        >
          <img
            src="https://i.imgur.com/q6TZIlM.png"
            alt="Angry Pepe"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PitchVisualizer;
