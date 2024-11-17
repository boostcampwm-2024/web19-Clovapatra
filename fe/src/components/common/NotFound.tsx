import { Button } from '@/components/ui/button';
import Lottie from 'lottie-react';
import LottieFile from '@/assets/lottie/404.json';

export const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <div className="w-96 h-96">
        <Lottie
          animationData={LottieFile}
          loop={true}
          className="w-full h-full"
        />
      </div>
      <h1 className="font-galmuri text-2xl font-bold text-center mt-6 mb-2">
        앗! 방을 찾을 수 없습니다.
      </h1>
      <p className="font-galmuri text-xl text-muted-foreground mb-8">
        방이 삭제되었거나 존재하지 않는 방입니다.
      </p>
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
