export const MEDIA_CONSTRAINTS = Object.freeze({
  audio: {
    echoCancellation: true, // 에코 제거
    noiseSuppression: true, // 노이즈 제거
    autoGainControl: true, // 자동 게인 제어
    channelCount: 1, // 모노 채널
    sampleRate: 16000, // 16kHz 샘플레이트
    sampleSize: 16, // 16비트 샘플 크기
  },
  video: false, // 비디오 비활성화
});
