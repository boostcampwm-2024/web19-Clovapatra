import { useCallback } from 'react';

export const useAudioManager = () => {
  const setAudioStream = useCallback((peerId: string, stream: MediaStream) => {
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
  }, []);

  const setVolume = useCallback((peerId: string, volume: number) => {
    const audioElement = document.getElementById(
      `audio-${peerId}`
    ) as HTMLAudioElement;

    if (audioElement) {
      audioElement.volume = volume;
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
