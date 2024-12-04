import Lottie from 'lottie-react';
import podiumAnimation from '@/assets/lottie/podium.json';
import useGameStore from '@/stores/zustand/useGameStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useParams } from 'react-router-dom';
import { getCurrentRoomQuery } from '@/stores/queries/getCurrentRoomQuery';
import useRoomStore from '@/stores/zustand/useRoomStore';

const EndScreen = () => {
  const rank = useGameStore((state) => state.rank);
  const resetGame = useGameStore((state) => state.resetGame);
  const { roomId } = useParams();
  const { refetch } = getCurrentRoomQuery(roomId);
  const { setCurrentRoom } = useRoomStore();

  const handleGameEnd = async () => {
    try {
      resetGame();
      // room 정보 다시 가져오기
      const { data } = await refetch();
      // 새로운 room 정보로 상태 업데이트
      if (data) {
        setCurrentRoom(data);
      }
    } catch (error) {
      console.error('Failed to refresh room data:', error);
    }
  };

  const positions = {
    0: { top: '18%', left: '49.7%' },
    1: { top: '54%', left: '34.5%' },
    2: { top: '68%', left: '60.5%' },
  };

  const getDelay = (index: number) => {
    switch (index) {
      case 2:
        return 0.7;
      case 1:
        return 1.4;
      case 0:
        return 2.1;
      default:
        return 0;
    }
  };

  return (
    <div className="relative h-[27rem] md:h-[calc(100vh-20rem)] md:min-h-[27rem] md:max-h-[34rem] bg-white rounded-lg overflow-hidden">
      <div className="h-full w-full flex items-center">
        <Lottie
          animationData={podiumAnimation}
          loop={false}
          className="w-full max-w-2xl absolute left-1/2 transform -translate-x-1/2"
        />
        <div className="absolute inset-0 pointer-events-none">
          {rank.slice(0, 3).map((playerName, index) => (
            <motion.div
              key={`rank-${index}-${playerName}`}
              className="absolute"
              style={{
                top: positions[index as keyof typeof positions].top,
                left: positions[index as keyof typeof positions].left,
                transform: 'translate(-50%, -120%)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: getDelay(index),
                duration: 0.4,
                ease: 'easeOut',
              }}
            >
              <motion.div
                className="text-center whitespace-nowrap"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: getDelay(index),
                  duration: 0.5,
                  ease: [0.175, 0.885, 0.32, 1.275],
                }}
              >
                <span className="block text-lg font-bold text-black">
                  {playerName}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="absolute top-4 right-4 bg-white/90 p-4 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          <h3 className="font-galmuri font-bold mb-2">최종 순위</h3>
          <div className="space-y-1">
            {rank.map((playerName, index) => (
              <div
                key={playerName}
                className="font-galmuri flex gap-2 text-sm items-center"
              >
                <span className="font-bold min-w-[24px]">{index + 1}위</span>
                <span>{playerName}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="absolute bottom-4 right-4 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5 }}
        >
          <Button
            onClick={handleGameEnd}
            size="default"
            className="font-galmuri"
          >
            <span className="hidden md:inline">로비로 돌아가기</span>
            <span className="md:hidden">
              로비로
              <br />
              돌아가기
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default EndScreen;
