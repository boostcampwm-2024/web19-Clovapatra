export const PITCH_CONSTANTS = {
  // 주파수 관련 상수 (Hz 단위)
  MIN_FREQ: 100, // 최소 감지 주파수
  MAX_FREQ: 1000, // 최대 감지 주파수
  MID_FREQ: 550, // 중간 주파수
  FREQ_MULTIPLIER: 1.25, // 음계 보정치 배율

  // 불투명도 설정
  MIN_OPACITY: 0.0, // 최소 불투명도
  MAX_OPACITY: 1.0, // 최대 불투명도
  INITIAL_OPACITY: 0.0, // 초기 불투명도

  // 로깅 및 볼륨 관련
  LOG_INTERVAL: 1000, // 로그 출력 간격 (ms)
  MIN_VOLUME_THRESHOLD: 0.35, // 최소 인식 볼륨 임계값

  // 시각화 관련 상수
  VISUALIZER_MIN_SCALE: 0.5, // 최소 스케일
  VISUALIZER_MAX_SCALE: 1.25, // 최대 스케일
  VISUALIZER_VOLUME_MULTIPLIER: 1.0, // 볼륨에 따른 스케일 배율

  // 애니메이션 관련 상수
  ANIMATION_SPRING_CONFIG: {
    type: 'spring',
    stiffness: 700,
    damping: 30,
    mass: 1,
  } as const,

  // 트랜지션 타이밍
  OPACITY_TRANSITION_DURATION: 0.5, // 불투명도 변화 지속 시간
  SCALE_TRANSITION_DURATION: 2.5, // 크기 변화 지속 시간

  // 컨테이너 크기 (반응형)
  CONTAINER_SIZE: '80vw', // 페페 화면 너비
} as const;
