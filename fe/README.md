## 🔍 문제 해결 과정

### 새로운 게임방이 추가될 때 순서대로 추가되지 않음

### 게임 페이지에서 새로고침하면 렌더링이 완전히 되지 않음

- VolumeBar `defaultValue` state 업데이트가 연속적으로 발생할 수 있는 구조
- Controlled Component? Uncontrolled Component? 혼용하면 무한 상태 업데이트 루프 발생?

### 게임 페이지에서 새로고침하면 players들이 사라짐, 마이크도 안 됨

- 새로고침이 아주 문제다!

### 개발 환경에서 잘 실행되다가 배포한 후 제대로 실행이 안 됨

- 빌드된 것은 잘 되는데.. `npm run dev` 하면 제대로 동작하지 않음
- JS 접근제어자 #을 써서 그런가 의심.. (확실하지 않음)
- 해결하지 못해서 잘 동작하던 상태로 되돌리고 진행🥲

### 방을 생성한 사용자만 currentRoom 상태가 Store에 저장 돼서, 이미 생성된 방에 입장하려는 사용자는 currentRoom에 저장된 상태가 없음

- signalingSocket.joinRoom을 하려면 현재 room을 전달해 주어야 한다. 그런데 저장된 currentRoom이 없다.
- getRoomsQuery로 방 목록을 가져오고 roomId에 해당하는 room을 찾은 후 상태를 저장하고 signalingSocket에 전달하도록 함.
- JoinDialog에서도 currentRoom을 구독하도록 하면 안 되려나..? 뭔가 방법이 있을 것 같은데,,
