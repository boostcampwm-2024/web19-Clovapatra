import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Users, Volume2, Zap, Smartphone, Laptop } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="game-wrapper">
      <section
        className="min-h-screen relative flex flex-col items-center justify-center text-center p-4 overflow-hidden rounded-t-2xl" // rounded-t-3xl로 변경
        style={{
          backgroundImage:
            "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/desert-bg-PZ3mAo0uZgBqi3T4EaMHe8MCM7knxx.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banner-dwvYQ4VkLXZnBSy5prmkgdUiDauMEA.png"
            alt="안녕! 클로바파트라"
            className="w-full max-w-2xl mx-auto mb-8"
          />
          <p className="font-pretendard font-bold text-white text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            음성으로 즐기는 실시간 웹 게임! 친구들과 함께 목소리로 도전하세요.
          </p>
          <Button
            size="lg"
            className="bg-[#00b894] hover:bg-[#00a884] font-pretendard font-bold text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            onClick={() => (window.location.href = '/rooms')}
          >
            지금 바로 게임하기
          </Button>
          <p className="font-pretendard font-bold text-white mt-4 text-sm">
            회원가입 없이 즉시 플레이 가능!
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-24"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              fill="#00b894"
            ></path>
          </svg>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-[#00b894] to-[#00a884]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-pretendard text-4xl font-bold text-center text-white mb-16">
            주요 기능
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-white/90 backdrop-blur transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col items-center text-center gap-4">
                <Users className="w-16 h-16 text-[#00b894]" />
                <h3 className="text-2xl font-pretendard font-semibold">
                  멀티플레이
                </h3>
                <p className="font-pretendard font-medium">
                  친구들과 함께 실시간으로 게임을 즐기세요. 최대 4명까지 참여
                  가능한 즐거운 경험!
                </p>
              </div>
            </Card>
            <Card className="p-6 bg-white/90 backdrop-blur transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col items-center text-center gap-4">
                <Mic className="w-16 h-16 text-[#00b894]" />
                <h3 className="text-2xl font-pretendard font-semibold">
                  음성 도전
                </h3>
                <p className="font-pretendard font-medium">
                  목소리로 진행되는 다양한 도전 과제! 발음과 음정을 분석하여
                  점수를 획득하고 승리를 쟁취하세요.
                </p>
              </div>
            </Card>
            <Card className="p-6 bg-white/90 backdrop-blur transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col items-center text-center gap-4">
                <Volume2 className="w-16 h-16 text-[#00b894]" />
                <h3 className="text-2xl font-pretendard font-semibold">
                  실시간 음성 채팅
                </h3>
                <p className="font-pretendard font-medium">
                  고품질 음성 채팅으로 끊김 없는 소통을 즐기세요. 게임 중 전략을
                  논의하거나 함께 웃고 떠들어보세요!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-pretendard font-bold text-center mb-16">
            게임 모드
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-pretendard font-semibold text-[#00b894]">
                  클레오파트라 모드
                </h3>
                <p className="font-pretendard font-medium">
                  이전 참가자보다 높은 음을 내야 하는 도전 게임입니다. 얼마나
                  높은 음까지 낼 수 있을까요? 목소리 컨트롤의 달인이 되어보세요!
                </p>
              </div>
              <div className="aspect-video bg-gray-200">
                <img
                  src="https://i.imgur.com/C2I0jNW.gif"
                  alt="클레오파트라 모드 GIF"
                  className="object-cover w-full h-full"
                />
              </div>
            </Card>
            <Card className="overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-pretendard font-semibold text-[#00b894]">
                  발음 도전 모드
                </h3>
                <p className="font-pretendard font-medium">
                  주어진 문장을 정확하게 발음하여 90점 이상을 획득해야 하는 도전
                  게임입니다. 당신의 발음 실력을 뽐내보세요!
                </p>
              </div>
              <div className="aspect-video bg-gray-200">
                <img
                  src="https://i.imgur.com/XNEw8tq.gif"
                  alt="발음 도전 모드 GIF"
                  className="object-cover w-full h-full"
                />{' '}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-pretendard font-bold text-center mb-16">
            추가 특징
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-gradient-to-br from-[#00b894] to-[#00a884] text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col items-center text-center gap-4">
                <Zap className="w-16 h-16" />
                <h3 className="text-2xl font-pretendard font-semibold">
                  간편한 시작
                </h3>
                <p className="font-pretendard font-medium">
                  회원가입이나 로그인 없이 즉시 게임을 시작할 수 있습니다. 클릭
                  한 번으로 친구들과 함께 즐겨보세요!
                </p>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-[#00b894] to-[#00a884] text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col items-center text-center gap-4">
                <Smartphone className="w-16 h-16" />
                <h3 className="text-2xl font-pretendard font-semibold">
                  모바일 지원
                </h3>
                <p className="font-pretendard font-medium">
                  스마트폰이나 태블릿에서도 완벽하게 작동합니다. 언제 어디서나
                  게임을 즐길 수 있어요!
                </p>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-[#00b894] to-[#00a884] text-white transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <div className="flex flex-col items-center text-center gap-4">
                <Laptop className="w-16 h-16" />
                <h3 className="text-2xl font-pretendard font-semibold">
                  크로스 플랫폼
                </h3>
                <p className="font-pretendard font-medium">
                  PC, 태블릿, 스마트폰 등 다양한 디바이스에서 동일한 경험을
                  제공합니다. 어떤 기기에서든 즐겨보세요!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-[#00b894] text-white text-center rounded-b-2xl">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-pretendard font-bold mb-8">
            지금 바로 시작하세요!
          </h2>
          <p className="font-pretendard font-medium text-xl mb-8">
            친구들과 함께 즐거운 음성 게임의 세계로 빠져보세요. 회원가입 없이
            바로 시작할 수 있습니다!
          </p>
          <Button
            size="lg"
            className="bg-white font-pretendard font-bold text-[#00b894] hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            onClick={() => (window.location.href = '/rooms')}
          >
            게임 시작하기
          </Button>
        </div>
      </section>
    </div>
  );
}
