// 음계 데이터 관련 타입
export interface PitchData {
  pitch: number; // 현재 음계 값
  timestamp: number; // 음계가 측정된 시간
}

// 음계 상태 관리를 위한 타입
export interface PitchState {
  currentPitch: number; // 현재 음계
  maxPitch: number; // 최대 음계
  minPitch: number; // 최소 음계
  lastUpdateTime: number; // 마지막 업데이트 시간
}

// 오디오 분석기 설정 타입
export interface AudioAnalyzerConfig {
  fftSize: number; // FFT 크기
  smoothingTimeConstant: number; // 스무딩 상수
  minDecibels: number; // 최소 데시벨
  maxDecibels: number; // 최대 데시벨
}

// 음계 추출기 인터페이스
export interface PitchDetector {
  analyzePitch: (audioData: Float32Array) => number;
}
