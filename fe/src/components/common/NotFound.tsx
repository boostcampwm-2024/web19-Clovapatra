import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <div className="relative w-screen h-80">
        <motion.div
          className="absolute whitespace-nowrap"
          initial={{ x: '100vw' }}
          animate={{ x: '-100%' }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="flex flex-col items-center">
            <span className="font-galmuri font-bold text-9xl">4 0 4</span>
            <span className="font-galmuri font-bold text-6xl mt-12">
              PAGE NOT FOUND
            </span>{' '}
            {/* 간격 증가 */}
          </div>
        </motion.div>
      </div>
      <h1 className="font-galmuri text-3xl font-bold text-center mt-6 mb-2">
        앗! 방을 찾을 수 없습니다.
      </h1>
      <span className="font-galmuri font-bold text-2xl mb-8 p-1">
        방이 삭제되었거나 존재하지 않는 방입니다.
      </span>
      <Button
        onClick={() => (window.location.href = '/')}
        className="font-galmuri"
        size="lg"
      >
        메인으로 돌아가기
      </Button>
    </div>
  );
};
