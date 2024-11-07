import { AudioStreamSetup } from '@/types/audioTypes';

export const requestAudioStream = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1,
      },
      video: false,
    });
    return stream;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        throw new Error(
          '마이크 사용 권한이 거부되었습니다. 권한을 허용해주세요.'
        );
      } else if (error.name === 'NotFoundError') {
        throw new Error(
          '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.'
        );
      }
    }
    throw new Error('마이크 접근에 실패했습니다.');
  }
};

export const cleanupAudioStream = (stream: MediaStream) => {
  stream.getTracks().forEach((track) => track.stop());
};

export const setupAudioStream = async (
  stream: MediaStream
): Promise<AudioStreamSetup> => {
  try {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const gainNode = audioContext.createGain();

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 기본 볼륨 설정
    gainNode.gain.value = 0.5;

    return {
      audioContext,
      source,
      gainNode,
    };
  } catch (error) {
    console.error('Error setting up audio stream:', error);
    throw error;
  }
};
