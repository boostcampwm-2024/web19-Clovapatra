# 안녕! 클로바파트라 🗣️

![image](https://github.com/user-attachments/assets/8001fa14-a691-4693-bd02-9aebd811f548)

[![Hits Badge](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fboostcampwm-2024%2Fweb19-boostproject&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)

<a href="https://clovapatra.com">서비스 바로가기(https://clovapatra.com)</a>

**안녕! 클로바파트라**는 음성 기반 실시간 웹 게임 프로젝트입니다. 이 서비스는 참가자들이 다양한 음성 도전을 통해 실시간으로 소통하며 재미를 느낄 수 있도록 설계되었습니다.

---

## 📄 목차

- [📜 프로젝트 개요](#-프로젝트-개요)
- [🚀 주요 기능](#-주요-기능)
- [⚙️ 기술 스택](#️-기술-스택)
- [🏛️ 시스템 아키텍처](#️-시스템-아키텍처)
- [🛠️ 설치 및 실행 방법](#️-설치-및-실행-방법)
- [📂 프로젝트 구조](#-프로젝트-구조)
- [🔗 관련 문서](#-관련-문서)

---

## 📜 프로젝트 개요

**안녕! 클로바파트라**는 참가자들이 음성을 기반으로 도전을 수행하며, 게임을 즐기는 실시간 소셜 플랫폼입니다.

- 사용자들은 자신의 목소리로 게임을 플레이하며, 발음, 음정 등의 도전을 통해 경쟁합니다.
- WebRTC와 음성 분석 기술을 활용하여 음성 데이터를 실시간으로 처리하며, Clova Speech Recognition API를 통해 발음의 정확도를 측정합니다.

---

## 🚀 주요 기능

### 1. 멀티플레이 지원

- **방 개설 및 관리**: 사용자는 게임 방을 생성하고 친구를 초대하여 실시간으로 소통할 수 있습니다.
- **실시간 음성 통화**: WebRTC 기반의 실시간 통화 기능을 제공합니다.
- **참가자 관리**: 방 참여, 준비 상태 토글, 강퇴 등의 기능을 지원합니다.

### 2. 게임 모드

- **클레오파트라 모드**: 이전 참가자보다 높은 음정을 내는 것을 목표로 하는 도전 게임.
- **발음 도전 모드**: 주어진 지문을 정확히 발음하여 Clova Speech Recognition API로 점수를 측정.

### 3. 음성 분석

- **음정 분석**: 실시간으로 음성 데이터를 분석하여 음정의 높낮이를 비교.
- **발음 점수화**: Clova Speech Recognition API를 활용해 발음 정확도를 측정.
- **볼륨 분석**: 음량을 분석하여 시각적으로 표현.

---

## ⚙️ 기술 스택

### 프론트엔드

- **React**: 사용자 인터페이스 개발
- **WebRTC**: 실시간 통신 및 음성 데이터 전송
- **Socket.IO**: 실시간 통신 구현

### 백엔드

- **NestJS**: 서버 및 게임 로직 관리
- **Express**: 음성 처리 및 시그널링 서버
- **Redis**: Pub/Sub 및 캐싱, 방 저장
- **MySQL**: 유저 데이터 저장

### 기타

- **Naver Clova Speech Recognition API**: 음성 데이터 분석
- **Docker**: 컨테이너화 및 배포
- **NGINX**: 로드 밸런싱 및 요청 라우팅

---

## 🏛️ 시스템 아키텍처

![System Architecture](https://github.com/user-attachments/assets/25683f10-1daa-41d8-a82f-5fe7f2b3f55f)

### 주요 컴포넌트

1. **클라이언트 그룹**:
   - WebRTC 기반의 P2P MESH 연결로 음성 데이터 전송.
   - React로 구성된 사용자 인터페이스.
   - Zustand를 통한 전역 상태 관리.
2. **게임 서버**:
   - Socket.IO와 NestJS를 통해 실시간 게임 로직을 관리.
3. **시그널링 서버**:
   - WebRTC 연결 초기화를 위한 시그널링 처리.
4. **음성 처리 서버**:
   - Express 기반 음성 데이터 분석 처리.
   - 병목 현상 방지를 위한 다중화
5. **저장소**:
   - Redis: Pub/Sub 및 게임 상태 캐싱.
   - MySQL: 데이터 영구 저장.

---

## 🛠️ 설치 및 실행 방법

### 1. **환경 변수 설정**

`dotenv` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
CLOVA_API_KEY=your_clova_api_key
```

### 2. **프로젝트 클론**

```bash
git clone https://github.com/boostcampwm-2024/web19-boostproject.git
cd web19-boostproject
```

### 3. **의존성 설치**

```bash
npm install
```

### 4. **로컬 개발 서버 실행**

```bash
npm run dev
```

### 5. **Docker로 실행(진행중)**

```bash
docker-compose up --build
```

---

## 📂 프로젝트 구조

```plaintext
web19-boostproject/
├── fe/                           # Frontend(React 기반 클라이언트)
│   ├── src/                      # 소스 코드 폴더
│   │   ├── components/           # UI 컴포넌트
│   │   ├── hooks/                # Custom Hooks (상태 및 로직 재사용)
│   │   ├── pages/                # 페이지 컴포넌트 (라우트 매핑)
│   │   └── utils/                # 공통 유틸리티 함수
├── be/                           # Backend
│   ├── gameServer/               # 게임 로직과 상태 관리를 담당하는 NestJS 서버
│   ├── signalingServer/          # WebRTC 시그널링을 처리하는 Express 서버
│   ├── voiceProcessingServer/    # 음성 데이터를 분석하는 Express 서버
└── docker-compose.yml            # Docker 설정 파일 (준비 중)
```

---

## 🔗 관련 문서

- 🛠️ [AGT - Automatic Git & Github Tool](https://github.com/boostcampwm-2024/web19-Clovapatra/wiki/%F0%9F%9B%A0%EF%B8%8F-AGT-%E2%80%90-Automatic-Git-&-Github-Tool)
- 📊 [WebRTC Mesh ‐ 트래픽 계산](https://github.com/boostcampwm-2024/web19-Clovapatra/wiki/%F0%9F%93%8A-WebRTC-Mesh-%E2%80%90-%ED%8A%B8%EB%9E%98%ED%94%BD-%EA%B3%84%EC%82%B0)
- 🎢 [WebRTC Mesh - 험난한 여정](https://github.com/boostcampwm-2024/web19-Clovapatra/wiki/%F0%9F%8E%A2-WebRTC-Mesh-%E2%80%90-%ED%97%98%EB%82%9C%ED%95%9C-%EC%97%AC%EC%A0%95)
- 📮 [SSE(Server Sent Events)](<https://github.com/boostcampwm-2024/web19-Clovapatra/wiki/%F0%9F%93%AE-SSE(Server-Sent-Events)>)
- 💬 [WebRTC를 알아보자](https://github.com/boostcampwm-2024/web19-Clovapatra/wiki/%F0%9F%92%AC-WebRTC%EB%A5%BC-%EC%95%8C%EC%95%84%EB%B3%B4%EC%9E%90)
- 📡 [Redis pub/sub를 활용한 SSE 적용기](https://github.com/boostcampwm-2024/web19-Clovapatra/wiki/%F0%9F%93%A1-Redis-pubsub%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-SSE-%EC%A0%81%EC%9A%A9%EA%B8%B0)
- 🏗️ [Naver Cloud Platform을 활용한 배포 전략](https://github.com/boostcampwm-2024/web19-Clovapatra/wiki/%E2%98%81%EF%B8%8FNaver-Cloud-Platform%EC%9D%84-%ED%99%9C%EC%9A%A9%ED%95%9C-%EB%B0%B0%ED%8F%AC-%EC%A0%84%EB%9E%B5)

---

**"안녕! 클로바파트라"와 함께 독창적인 음성 기반 게임의 세계로 빠져보세요!** 🎤
