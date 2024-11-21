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
- 문제 발견: 게임방에 처음 입장하면 gainNode가 없음 -> 새로고침 하면 되는데 왜지..?  
  느낌상 room_info에서 데이터를 받아와서 상태 저장하기 전에 setVolume을 하려고 해서 그런 것 같음
  ```tsx
  setVolume(peerId: string, volume: number) {
    const gainNode = this.gainNodes.get(peerId);
    if (gainNode) {
      gainNode.gain.value = volume;
      console.log(gainNode.gain.value);
    }
  }
  ```

### 방을 처음 생성할 때 room_info 이벤트로 수신하는 userMappings에 hostNickname이 안 담기는 문제

- useEffect 내에서 signalingSocket에 join 하고 있어서 안 됨
- resetAndClose로 Dialog 컴포넌트 언마운트 되는데 useEffect 실행 시도
  - Dialog가 너무 일찍 언마운트돼서 useEffect 실행이 제대로 안 됨
  - 비동기 작업 순서가 보장되지 않음
- 이벤트 리스너 방식
  - 이벤트 리스너를 먼저 등록하고 방 생성 요청하여 작업 순서 보장
  - 컴포넌트 생명주기와 관계없이 이벤트 리스너 동작

### AudioContext -> HTMLAudioElement 사용으로 변경

- 단순 볼륨 조절만 필요하기 때문에 AudioContext를 사용할 필요가 없다고 판단
- useAudioManager hook에서 원격 스트림 설정(Audio Element 생성), 볼륨 조절, 특정 Audio Element 제거, 모든 Audio Elements 제거 함수를 제공하여 signalingSocket 및 VolumeBar에서 사용할 수 있도록 함
- GamePage에서 useEffect에 audioManager 의존성 주입이 필요한 이유

  - signalingSocket은 클래스로 구현되어 있어 React hook을 직접 사용할 수 없다.
  - GamePage 컴포넌트가 언마운트될 때 audioManager를 null로 설정하여 메모리 누수를 방지하고, 페이지를 나간 후에도 오디오가 계속 재생되는 것을 막음
  - useEffect가 없으면 원격 스트림을 받았을 때 audioManager가 없어 오디오를 처리할 수 없다.
  - 아래와 같이 하게 되면 컴포넌트가 언마운트될 때 audioManager를 null로 설정하는 정리 작업을 할 수 없고, 컴포넌트가 리렌더링될 때마다 setAudioManager가 호출된다. useEffect를 사용하면 audioManager가 변경될 때만 호출 됨

    ```tsx
    const GamePage = () => {
      const audioManager = useAudioManager();
      signalingSocket.setAudioManager(audioManager);
    };
    ```

### Voice Server Error: Invalid session? 비동기 문제

- 방장이 게임 시작 버튼을 눌렀을 때, 제대로 동작할 때도 있고 이 에러가 뜰 때도 있다.
- 에러가 뜨고 다시 눌렀을 때 다시 동작할 때도 있고, 계속 안 될 때도 있다.
- 왜 그러는지 모르겠다..! -> 비동기 문제😭
- 로직 순서: gameSocket.startGame -> turnChanged 수신 turnData 상태 저장 -> voiceSocket.startRecording(turnData에 현재 차례 사용자 정보 있음) 그런데 startRecording은 비동기 함수,,
- 원인: gameSocket.startGame으로 수신하는 turnData가 상태로 저장되기 전에 voiceSocket.startRecording을 해버렸기 때문
- 해결
  - handleGameStart 내에서 startGame, startRecording 둘 다 해버리면 죽어도 해결할 수 없다는 것을 깨달음
  - startRecording에 await 하면 되겠지 했던 게 잘못된 생각이었다,,
  - useEffect로 turnData 상태가 변할 때 startRecording을 하도록 바꿨다.
  - 그리고 isGameStarted라는 flag를 두고 한 명씩 턴이 끝날 때마다 이 flag를 바꿔주면서 차례대로 게임을 진행할 수 있도록 함
