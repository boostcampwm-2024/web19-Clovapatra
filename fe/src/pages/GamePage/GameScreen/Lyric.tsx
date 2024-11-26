import { motion, AnimatePresence } from 'framer-motion';

interface LyricProps {
  text: string;
  timing: number;
  isActive: boolean;
  playerIndex?: number;
}

const Lyric = ({ text, timing, isActive, playerIndex = 0 }: LyricProps) => {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <div className="absolute inset-0 flex items-center">
          <motion.div
            key={`lyric-${playerIndex}`}
            className="absolute whitespace-nowrap"
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            exit={{ opacity: 0 }}
            transition={{
              duration: timing,
              ease: 'linear',
              delay: -0.5,
              immediate: true,
            }}
          >
            <span className="font-galmuri text-4xl text-primary">{text}</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Lyric;
