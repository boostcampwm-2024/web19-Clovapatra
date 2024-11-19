## 🔍 문제 해결 과정

### 새로운 게임방이 추가될 때 순서대로 추가되지 않음

### useRoomStore 사용

- 훅/컴포넌트 내부에서 사용: useRoomStore()
- React 외부의 비동기 작업, 이벤트 핸들러: useRoomStore.getState()

### 본인 닉네임 상태 저장

- 방장 여부에 따라 게임 시작/게임 준비, 강퇴 버튼 보임/안 보임이 결정 됨
- GameScreen에서 자기자신이 방장이 아닌 걸 알기 위해서 currentPlayer 상태 저장하고, 새로고침 시 sessionStorage에서 가져와서 다시 저장

### 오디오 권한 요청 hook 분리

- 마이크 권한 허용하지 않을 시 게임방 입장 불가
  - hook으로 마이크 허용 확인 후 signalingSocket join
  - TODO: 허용하지 않을 시 Error 메시지 사용자에게 띄워야 함
- CreateDialog, JoinDialog에 마이크 허용 안내 문구 추가

### 새로고침 시 오디오 꺼짐 문제

- signalingSocket connect되기 전(초기화되기 전) 이벤트 emit하지 않도록 setTimeout 설정
- useReconnect hook에서 오디오 재연결 처리해 줘야 함

### 본인을 제외한 사용자들의 볼륨 조절

- 시그널링 소켓에서 Audio Element의 id를 peerId(소켓 id)로 설정하고 있음
- 그런데 클라이언트 쪽에서 사용자 닉네임과 peerId가 매칭되는 정보를 알 수 없음
- 어떤 사용자의 볼륨을 줄이려면 해당 사용자의 peerId로 Audio Element를 찾아야 함
- 그래서 시그널링 소켓 join_room 이벤트 송신 시 playerNickname을 같이 전달하고, room_info 이벤트를 수신할 때 playerNickname을 key, peerId를 value로 하는 데이터를 받아온 후 해당 데이터를 가지고 Audio Element를 찾는 것으로 서버 측과 합의
- signalingSocket에서 로그 찍어보고 동작하고 있는 건 확인했는데, 로컬에서 테스트는 불가
  - 왜냐하면 둘 다 나이기 때문.. 다른 사람의 볼륨을 조절 하려면 결국 한 사용자는 마이크를 켜야 하는데, 둘 다 내 목소리니까 구분이 안 됨
  - 본인 마이크 음소거는 테스트 완
