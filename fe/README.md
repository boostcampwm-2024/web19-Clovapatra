## 🔍 문제 해결 과정

### 새로운 게임방이 추가될 때 순서대로 추가되지 않음

### SSE(Server Sent Events)로 방 목록 가져오기

- [x] RoomList Page에서 새로고침 하면 방 목록이 보여야 한다.
- [x] 새로운 방이 생성되었을 때 각 사용자의 페이지에 생성된 방 목록이 바로 보여야 한다.
- [x] 새로운 탭을 열어 Page가 로드되면 방 목록이 보여야 한다.
- [x] 방이 닫히면 방 목록에서 바로 제거되어야 한다.

- 이 부분을 getRoomsQuery & setInterval 줘서 해뒀었다. 3초에 한 번씩 refetch 해서 rooms 상태를 저장했다.
- SSE를 사용해서 rooms의 상태가 변경될 때 이벤트를 수신해서 rooms 데이터를 받아올 수 있다.
- SSE는 서버에서 발생하는 새로운 이벤트(변경 사항)만 받아오는 방식이기 때문에 페이지를 처음 로드하거나 새로고침 할 때는 기존 데이터를 한 번 받아와야 한다. = GET 요청 필요

### useRoomStore 사용

- 훅/컴포넌트 내부에서 사용: useRoomStore()
- React 외부의 비동기 작업, 이벤트 핸들러: useRoomStore.getState()
