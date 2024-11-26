import { PITCH_CONSTANTS } from '@/constants/pitch';

export class PitchDetector {
  private audioContext: AudioContext | null = null;
  private analyzer: AnalyserNode | null = null;
  private animationFrame: number | null = null;
  private lastLogTime = 0;
  private lastPitch = 0;
  private isActive = false;
  private source: MediaStreamAudioSourceNode | null = null;

  /**
   * 피치 검출기 설정 함수
   * @param stream 오디오 스트림
   * @param onPitchUpdate 피치 업데이트 콜백
   * @param playerInfo 현재 플레이어 정보
   * @param isGameActive 게임 활성화 여부
   */
  setup(
    stream: MediaStream,
    onPitchUpdate: (pitch: number, volume: number) => void,
    playerInfo: {
      currentPlayer: string;
      isCurrent: boolean;
    },
    isGameActive: boolean
  ) {
    try {
      this.cleanup();

      if (!isGameActive || !stream) {
        console.log('게임이 활성화되지 않았거나 스트림이 없습니다.');
        return;
      }

      console.log('Setting up PitchDetector for:', playerInfo.currentPlayer);

      // 오디오 컨텍스트 및 분석기 설정
      this.isActive = true;
      this.audioContext = new AudioContext();
      this.analyzer = this.audioContext.createAnalyser();

      // 분석기 설정
      this.analyzer.fftSize = 2048;
      this.analyzer.smoothingTimeConstant = 0.8;
      this.analyzer.minDecibels = -90;
      this.analyzer.maxDecibels = -10;

      // 스트림 소스 연결
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyzer);

      const analyzeFrequency = () => {
        if (!this.isActive || !this.analyzer || !this.audioContext) {
          this.cleanup();
          return;
        }

        // 주파수 도메인 데이터 분석 (Byte 단위)
        const bufferLength = this.analyzer.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);
        this.analyzer.getByteFrequencyData(frequencyData);

        // 피크 찾기
        let maxAmp = -Infinity;
        let maxIndex = -1;
        for (let i = 0; i < bufferLength; i++) {
          if (frequencyData[i] > maxAmp) {
            maxAmp = frequencyData[i];
            maxIndex = i;
          }
        }

        // 주파수 계산 (Hz)
        const fundamentalFrequency =
          (maxIndex * this.audioContext.sampleRate) / this.analyzer.fftSize;

        // 볼륨 계산 (RMS)
        const timeData = new Float32Array(this.analyzer.fftSize);
        this.analyzer.getFloatTimeDomainData(timeData);
        let sumSquares = 0;
        for (let i = 0; i < timeData.length; i++) {
          sumSquares += timeData[i] * timeData[i];
        }
        const rmsVolume = Math.sqrt(sumSquares / timeData.length);
        const normalizedVolume = Math.min(rmsVolume * 1000, 1); // 볼륨 정규화

        // 유효한 주파수 범위 내에서만 처리
        if (normalizedVolume > PITCH_CONSTANTS.MIN_VOLUME_THRESHOLD) {
          if (
            fundamentalFrequency >= PITCH_CONSTANTS.MIN_FREQ &&
            fundamentalFrequency <= PITCH_CONSTANTS.MAX_FREQ
          ) {
            // 주파수 스무딩
            const smoothedFrequency =
              this.lastPitch === 0
                ? fundamentalFrequency
                : 0.7 * this.lastPitch + 0.3 * fundamentalFrequency;

            this.lastPitch = smoothedFrequency;

            // 현재 값 업데이트 및 로깅
            onPitchUpdate(smoothedFrequency, normalizedVolume);

            const now = Date.now();
            if (now - this.lastLogTime >= PITCH_CONSTANTS.LOG_INTERVAL) {
              console.log(
                `[PitchDetector] ${playerInfo.currentPlayer}:`,
                `주파수=${Math.round(smoothedFrequency)}Hz,`,
                `볼륨=${(normalizedVolume * 100).toFixed(1)}%`
              );
              this.lastLogTime = now;
            }
          }
        } else if (this.lastPitch !== 0) {
          // 볼륨이 임계값 이하면 피치 리셋
          this.lastPitch = 0;
          onPitchUpdate(0, 0);
        }

        // 다음 프레임 예약
        if (this.isActive) {
          this.animationFrame = requestAnimationFrame(analyzeFrequency);
        }
      };

      // 분석 시작
      analyzeFrequency();
    } catch (error) {
      console.error('PitchDetector setup failed:', error);
      this.cleanup();
    }
  }

  /**
   * 피치 검출기 정리 함수
   */
  cleanup() {
    console.log('Cleaning up PitchDetector');

    this.isActive = false;

    // 애니메이션 프레임 정리
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // 오디오 소스 정리
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    // 분석기 정리
    if (this.analyzer) {
      this.analyzer.disconnect();
      this.analyzer = null;
    }

    // 오디오 컨텍스트 정리
    if (this.audioContext) {
      this.audioContext.close().catch(console.error);
      this.audioContext = null;
    }

    this.lastPitch = 0;
  }
}

export const createPitchDetector = () => new PitchDetector();
