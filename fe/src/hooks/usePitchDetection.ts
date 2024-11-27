import { useEffect, useRef, useState } from 'react';
import usePitchStore from '@/stores/zustand/usePitchStore';
import useGameStore from '@/stores/zustand/useGameStore';
import useRoomStore from '@/stores/zustand/useRoomStore';
import { signalingSocket } from '@/services/signalingSocket';
import { PitchDetector } from '@/utils/pitchDetection';

export function usePitchDetection(
  isCleopatraMode: boolean,
  stream: MediaStream | null
) {
  const { updatePitch } = usePitchStore();
  const { turnData } = useGameStore();
  const { currentPlayer } = useRoomStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pitchDetectorRef = useRef<PitchDetector | null>(null);

  // 클린업 함수 정의
  const cleanup = () => {
    if (pitchDetectorRef.current) {
      pitchDetectorRef.current.cleanup();
      pitchDetectorRef.current = null;
    }
    updatePitch(0, 0); // 피치와 볼륨을 모두 0으로 초기화
    setIsAnalyzing(false);
  };

  useEffect(() => {
    // 클레오파트라 모드가 아니거나, 턴 데이터가 없으면 pitch 분석 중지
    if (!isCleopatraMode || !turnData) {
      cleanup();
      return;
    }

    // 이미 분석 중이면 중복 실행 방지
    if (isAnalyzing) return;

    // 스트림이 없으면 대기 (스트림이 늦게 도착할 수 있음)
    if (!stream) {
      // 스트림이 도착할 때까지 대기
      const intervalId = setInterval(() => {
        const newStream = signalingSocket.getPeerStream(
          turnData.playerNickname
        );
        if (newStream) {
          clearInterval(intervalId);
          startPitchDetection(newStream);
        }
      }, 500);

      // 컴포넌트 언마운트 시 인터벌 클리어
      return () => clearInterval(intervalId);
    } else {
      // 스트림이 있으면 바로 pitch 분석 시작
      startPitchDetection(stream);
    }

    // 컴포넌트 언마운트 시 클린업
    return cleanup;
  }, [isCleopatraMode, stream, turnData, currentPlayer]);

  const startPitchDetection = (stream: MediaStream) => {
    // 기존 분석 중지 및 초기화
    cleanup();
    setIsAnalyzing(true);

    // 현재 플레이어가 턴을 진행 중인지 확인
    const isCurrentPlayerTurn = turnData.playerNickname === currentPlayer;

    // 피치 검출기 생성 및 설정
    const pitchDetector = new PitchDetector();
    pitchDetector.setup(
      stream,
      (pitch, volume) => {
        updatePitch(pitch, volume);
      },
      {
        currentPlayer: turnData.playerNickname,
        isCurrent: isCurrentPlayerTurn,
      },
      true // 게임이 활성화된 상태로 설정
    );

    pitchDetectorRef.current = pitchDetector;
  };

  return null; // 이 훅은 컴포넌트에 UI를 렌더링하지 않으므로 null 반환
}
