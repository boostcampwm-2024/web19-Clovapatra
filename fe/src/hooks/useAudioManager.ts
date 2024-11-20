import { useCallback } from 'react';

export const useAudioManager = () => {
  const setAudioStream = useCallback((peerId: string, stream: MediaStream) => {
    console.log('setAudioStream 호출됨:', peerId);
    const existingAudio = document.getElementById(
      `audio-${peerId}`
    ) as HTMLAudioElement;

    if (existingAudio) {
      existingAudio.remove();
    }

    const audioElement = new Audio();
    audioElement.id = `audio-${peerId}`;
    audioElement.srcObject = stream;
    audioElement.autoplay = true;
    audioElement.volume = 0.5; // 초기 볼륨

    document.body.appendChild(audioElement);
    console.log('오디오 엘리먼트 생성됨:', {
      peerId,
      volume: audioElement.volume,
    });
  }, []);

  const setVolume = useCallback((peerId: string, volume: number) => {
    console.log('1. setVolume 호출됨:', { peerId, volume });
    const audioElement = document.getElementById(
      `audio-${peerId}`
    ) as HTMLAudioElement;

    if (audioElement) {
      console.log('3. 볼륨 변경 전:', audioElement.volume);
      audioElement.volume = volume;
      console.log('4. 볼륨 변경 후:', audioElement.volume);
    } else {
      console.log('audioElement를 찾을 수 없음:', peerId);
    }
  }, []);

  const removeAudio = useCallback((peerId: string) => {
    const audioElement = document.getElementById(
      `audio-${peerId}`
    ) as HTMLAudioElement;
    if (audioElement) {
      audioElement.srcObject = null;
      audioElement.remove();
    }
  }, []);

  const cleanup = useCallback(() => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((audio: HTMLAudioElement) => {
      audio.srcObject = null;
      audio.remove();
    });
  }, []);

  return {
    setAudioStream,
    setVolume,
    removeAudio,
    cleanup,
  };
};
