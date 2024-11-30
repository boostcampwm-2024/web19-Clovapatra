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
import EndScreen from './EndScreen';
import ReadyScreen from './ReadyScreen';
import PitchVisualizer from '@/components/game/PitchVisualizer';

type GamePhase = 'intro' | 'gameplay' | 'grading' | 'result';

const PlayScreen = () => {
  const { currentRoom, currentPlayer } = useRoomStore();
  const { setGameResult } = useGameStore();
  const turnData = useGameStore((state) => state.turnData);
  const resultData = useGameStore((state) => state.resultData);
  const rank = useGameStore((state) => state.rank);
  const [gamePhase, setGamePhase] = useState<GamePhase>('intro');
  const [timeLeft, setTimeLeft] = useState(0);

  const INTRO_TIME = 2000;
  const RESULT_TIME = 3000;

  // 턴 데이터 변경 시 게임 초기화
  useEffect(() => {
    if (!turnData && !resultData) return;
    if (rank.length > 0) return;

    setGamePhase('intro');
    setGameResult(null);

    const introTimer = setTimeout(() => {
      setGamePhase('gameplay');
      setTimeLeft(turnData.timeLimit); // gameplay 페이즈로 전환될 때 시간 설정

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
        if (prev === 0) {
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

  // 채점 중 -> 결과 화면 전환
  useEffect(() => {
    if (resultData && gamePhase === 'grading') {
      setGamePhase('result');
    }
  }, [resultData, gamePhase]);

  // 다음 턴 result -> next 처리를 별도로
  useEffect(() => {
    if (!resultData || gamePhase !== 'result') return;

    const resultTimer = setTimeout(() => {
      gameSocket.next();
      setGameResult(null);
    }, RESULT_TIME);

    return () => clearTimeout(resultTimer);
  }, [gamePhase, resultData]);

  // 디버깅용 phase 변경 로그
  useEffect(() => {
    console.log('현재 게임 페이즈:', gamePhase);
  }, [gamePhase]);

  if (!turnData && !rank.length) return;

  return (
    <div className="relative h-[27rem] bg-white rounded-lg overflow-hidden">
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
              제한 시간: {timeLeft}초
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

      {turnData && (
        <PitchVisualizer isGameplayPhase={gamePhase === 'gameplay'} />
      )}

      {!turnData && rank.length > 0 && <ReadyScreen />}

      {rank.length > 0 && (
        <div className="absolute inset-0 z-50">
          <EndScreen />
        </div>
      )}
    </div>
  );
};

export default PlayScreen;
