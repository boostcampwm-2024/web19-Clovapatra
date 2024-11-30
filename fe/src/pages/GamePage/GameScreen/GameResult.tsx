import useGameStore from '@/stores/zustand/useGameStore';
import { motion } from 'framer-motion';

const GameResult = () => {
  const { resultData, turnData } = useGameStore();

  if (!resultData) return null;

  const getResultText = () => {
    const resultText = resultData.result === 'PASS' ? 'PASS!' : 'FAIL!';

    if (turnData?.gameMode === 'CLEOPATRA') {
      return `${resultData.note} ${resultText}`;
    }
    return `${resultData.pronounceScore}점 ${resultText}`;
  };

  return (
    <motion.div
      key="result"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="text-center">
        <div className="font-galmuri text-6xl font-bold mb-3">
          {resultData.playerNickname}
        </div>
        <motion.div
          key="bubble"
          className={`font-galmuri text-7xl font-bold ${
            resultData.result === 'PASS' ? 'text-cyan-500' : 'text-red-500'
          }`}
          initial={{ scale: 1 }}
          animate={{
            scale: [1, 1.2, 0.8, 1],
            opacity: [1, 0.9, 0.9, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          {getResultText()}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GameResult;
