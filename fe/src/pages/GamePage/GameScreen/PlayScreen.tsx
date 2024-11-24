import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { voiceSocket } from '@/services/voiceSocket';
import { signalingSocket } from '@/services/signalingSocket';
import useRoomStore from '@/stores/zustand/useRoomStore';
import useGameStore from '@/stores/zustand/useGameStore';
import Lyric from './Lyric';
import GameResult from './GameResult';
import { Loader2 } from 'lucide-react';
import { gameSocket } from '@/services/gameSocket';

type GamePhase = 'intro' | 'gameplay' | 'grading' | 'result';

const PlayScreen = () => {
  const { currentRoom, currentPlayer } = useRoomStore();
  const { setGameResult } = useGameStore();
  const turnData = useGameStore((state) => state.turnData);
  const resultData = useGameStore((state) => state.resultData);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [timeLeft, setTimeLeft] = useState(0);

  const INTRO_TIME = 2000;
  const RESULT_TIME = 3000;

  // 턴 데이터 변경 시 게임 초기화
  useEffect(() => {
    if (!turnData && !resultData) return;

    setGamePhase('intro');
    setTimeLeft(turnData.timeLimit);
    setGameResult(null);

    const introTimer = setTimeout(() => {
      setGamePhase('gameplay');

      // 현재 플레이어 차례이고 게임 참여 가능한 경우에만 녹음 시작
      if (currentPlayer === turnData.playerNickname && currentRoom) {
        voiceSocket
          .startRecording(
            signalingSocket.getLocalStream(),
            currentRoom.roomId,
            currentPlayer
          )
          .catch(console.error);
      }
    }, INTRO_TIME);

    return () => clearTimeout(introTimer);
  }, [turnData, currentRoom, currentPlayer]);

  // 타이머 처리
  useEffect(() => {
    if (gamePhase !== 'gameplay') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentPlayer === turnData?.playerNickname) {
            voiceSocket.disconnect();
          }
          setGamePhase('grading');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, currentPlayer, turnData]);

  // 결과 처리
  useEffect(() => {
    if (!resultData || (gamePhase !== 'grading' && gamePhase !== 'result'))
      return;

    // grading 페이즈에서만 result로 전환
    if (gamePhase === 'grading') {
      console.log('결과 수신, result 화면으로 전환');
      setGamePhase('result');
    }

    // result 페이즈에서 타이머 시작
    if (gamePhase === 'result') {
      console.log('결과 화면 타이머 시작');
      const resultTimer = setTimeout(() => {
        console.log('3초 경과, 다음 턴 호출');
        gameSocket.next();
        setGameResult(null);
      }, RESULT_TIME);

      return () => {
        console.log('결과 처리 cleanup');
        clearTimeout(resultTimer);
      };
    }
  }, [resultData, gamePhase, setGameResult]);

  // 디버깅용 phase 변경 로그
  useEffect(() => {
    console.log('현재 게임 페이즈:', gamePhase);
  }, [gamePhase]);

  if (!turnData) return;

  return (
    <div className="relative h-[27rem] bg-muted rounded-lg overflow-hidden">
      <AnimatePresence mode="wait">
        {gamePhase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div className="font-galmuri text-4xl font-bold mb-2">
              현재 차례 : {turnData.playerNickname}
            </div>
            <div className="font-galmuri text-2xl">
              {turnData.gameMode === 'CLEOPATRA' ? '클레오파트라' : '발음 미션'}
            </div>
          </motion.div>
        )}

        {gamePhase === 'gameplay' && (
          <div key="gameplay" className="relative h-full">
            <div className="font-galmuri absolute top-4 right-4 text-2xl font-bold">
              {timeLeft}초
            </div>
            <Lyric
              text={turnData.lyrics}
              timing={turnData.timeLimit}
              isActive={true}
            />
          </div>
        )}

        {gamePhase === 'grading' && (
          <motion.div
            key="grading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <div className="font-galmuri text-2xl">채점 중...</div>
          </motion.div>
        )}

        {gamePhase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameResult />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlayScreen;
