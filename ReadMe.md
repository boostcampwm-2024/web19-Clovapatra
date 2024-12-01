# 안녕! 클로바파트라 🗣️

![image](https://github.com/user-attachments/assets/8001fa14-a691-4693-bd02-9aebd811f548)

[![Hits Badge](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fboostcampwm-2024%2Fweb19-boostproject&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)

<a href="https://clovapatra.com">서비스 바로가기(https://clovapatra.com)</a>

**안녕! 클로바파트라**는 음성 기반 실시간 웹 게임 프로젝트입니다. 이 서비스는 참가자들이 다양한 음성 도전을 통해 실시간으로 소통하며 재미를 느낄 수 있도록 설계되었습니다.

**"안녕! 클로바파트라"와 함께 독창적인 음성 기반 게임의 세계로 빠져보세요!** 🎤

---

## 📄 목차

- [📜 프로젝트 개요](#-프로젝트-개요)
- [🚀 주요 기능](#-주요-기능)
- [⚙️ 기술 스택](#️-기술-스택)
- [🏛️ 시스템 아키텍처](#️-시스템-아키텍처)
- [📂 프로젝트 구조](#-프로젝트-구조)
- [🔗 관련 문서](#-관련-문서)

---

## 📜 프로젝트 개요

**안녕! 클로바파트라**는 참가자들이 음성을 기반으로 도전을 수행하며, 게임을 즐기는 실시간 웹 게임입니다.

- 사용자들은 자신의 목소리로 게임을 플레이하며, 발음, 음정 등의 도전을 통해 경쟁합니다.
- WebRTC와 음성 분석 기술을 활용하여 음성 데이터를 실시간으로 처리하며 음정을 분석하고, Clova Speech Recognition API를 통해 발음의 정확도를 측정합니다.

---

## 🚀 주요 기능

### 1. 멀티플레이 지원

- **방 개설 및 관리**: 사용자는 게임 방을 생성하거나 방에 입장하여 실시간으로 소통할 수 있습니다.
- **실시간 음성 통화**: WebRTC 기반의 실시간 통화 기능을 제공합니다.
- **참가자 관리**: 방 참여, 준비 상태 토글, 강퇴, 음소거, 볼륨 조절 등의 기능을 지원합니다.

![멀티플레이 지원](https://github.com/user-attachments/assets/b1c051e7-f581-451d-9cc0-517252db183f)

### 2. 게임 모드

- **클레오파트라 모드**: 이전 참가자보다 높은 음정을 내는 것을 목표로 하는 도전 게임.

![클레오파트라 모드](https://github.com/user-attachments/assets/a5b864a8-8836-42ad-83a0-efe5b51dc761)
  
- **발음 도전 모드**: 주어진 지문을 정확히 발음하여 90점 이상의 점수를 받는 것을 목표로하는 도전 게임.

![발음 도전 모드](https://github.com/user-attachments/assets/d6349380-ad28-4c41-ad79-a947870d816a)

### 3. 음성 분석

- **음정, 볼륨 분석**: 실시간으로 음성 데이터를 분석하여 음정의 높낮이, 음량의 크기를 시각화 및 비교.
- **발음 점수화**: Clova Speech Recognition API를 활용해 발음 정확도를 측정.

---

## ⚙️ 기술 스택

### 프론트엔드

- **React**: 사용자 인터페이스 개발
- **WebRTC**: 실시간 통신 및 음성 데이터 전송
- **Zustand**: 클라이언트 전역 상태 관리
- **TanStack Query: 서버 상태 관리
- **shadcn/ui**: Radix UI + TailwindCSS 컴포넌트 기반 스타일링

### 백엔드

- **NestJS**: 서버 및 게임 로직 관리
- **Express**: 음성 처리 및 시그널링 서버
- **Redis**: Pub/Sub 및 게임 방, 게임 관리
- **Socket.IO**: 실시간 양방향 통신

### 기타

- **Naver Cloud Platform**: 네이버 클라우드 플랫폼을 활용한 인프라 및 서비스 배포
- **Naver Clova Speech Recognition API**: 음성 데이터 분석
- **NGINX**: 로드 밸런싱 및 요청 라우팅
- **AGT**: 우리가 제작한 GitHub 이슈 기반 프로젝트 관리 툴

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

## 📂 프로젝트 구조

```plaintext
web19-boostproject/
├── .agt/                         # AGT (GitHub 이슈 기반 커스텀 프로젝트 관리 도구) 관련 설정 및 데이터 폴더
├── .github/                      # GitHub 관련 워크플로우 및 설정 파일 저장소 (CI/CD 파이프라인 등)
├── .nks/                         # NKS (Naver Clova Speech API 관련 설정 및 키 관리) 폴더
├── fe/                           # Frontend(React 기반 클라이언트)
│   ├── src/                      # 소스 코드 폴더
│   │   ├── components/           # UI 컴포넌트 폴더 (버튼, 입력창 등 재사용 가능한 컴포넌트)
│   │   ├── hooks/                # Custom Hooks 폴더 (상태 관리 및 로직 재사용)
│   │   ├── pages/                # 페이지 단위 컴포넌트 폴더 (라우터와 매핑된 화면들)
│   │   └── utils/                # 공통 유틸리티 함수 폴더 (데이터 변환, API 요청 등)
└── be/                           # Backend
    ├── gameServer/               # 게임 로직과 상태 관리를 담당하는 NestJS 서버
    ├── signalingServer/          # WebRTC 시그널링을 처리하는 Express 서버
    └── voiceProcessingServer/    # 음성 데이터를 분석하는 Express 서버
```

---

## 🔗 관련 문서

더 자세한 정보는 프로젝트 [**위키 페이지**](https://github.com/boostcampwm-2024/web19-boostproject/wiki)에서 확인할 수 있습니다.

- 프로젝트 상세 설명
- 주요 기술 및 아키텍처 분석
- 우리만의 GitHub 이슈 기반 프로젝트 관리 툴
- 회의록, 회고록

궁금하신 점이 있다면 언제든지 문의해주세요! 😊
