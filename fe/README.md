## 🔍 문제 해결 과정

### 새로운 게임방이 추가될 때 순서대로 추가되지 않음

### useRoomStore 사용

- 훅/컴포넌트 내부에서 사용: useRoomStore()
- React 외부의 비동기 작업, 이벤트 핸들러: useRoomStore.getState()

### 채점 중에서 게임 페이즈가 넘어가지 않는 문제

- 음소거 버튼 문제처럼 userUpdates로 상태가 변경되면 채점 중에서 넘어가지 않는다.
- 턴이 바뀌고 해당 차례의 사용자의 음성 정보를 넘겨줄 때 roomId가 필요한데 currentRoom의 roomId를 전달하고 있어서, updateUsers로 currentRoom이 변경되면 이 문제가 일어날 수 있다.
- 그래서 currentRoom에서 가져오지 않고, useParams로 가져와서 전달해 주니까 채점 중에서 넘어가지 않는 문제는 없어진 것 같다. (아직 모름..)
- 그런데 이렇게 처리하니까 게임 중일 때 또 다른 문제가 생겼다.
  - 자기 차례일 때 새로고침 시: 재입장 처리 돼서 순위에 2번 반영되고, 게임 준비 & 시작하면 이전 게임의 결과가 나와 버린다. (result가 초기화 되지 않음)
  - 다른 사람 차례일 때 새로고침 시: 순위에 2번 반영되지는 않지만, 역시나 게임 준비 & 시작하면 이전 게임의 결과가 나온다. (result가 초기화 되지 않음)
  - 새로고침 해서 준비 화면에 있는 상태에서 새로고침을 한 번 더 하면 정상 동작한다.
- 새로고침 할 때 방 나가기 처리를 해야할 것 같은데.. 잘 모르겠다.. ㅜ 일단 채점 중에서 멈춰있지는 않는 것 같다.

### ExitDialog 새로고침 후 뒤로가기 하면 취소 버튼에 포커싱

- KickDialog도 똑같이 shadcn/ui AlertDialog 컴포넌트를 쓰고 있는데, 강퇴 시에는 아무리 새로고침을 해도 취소 버튼에 포커싱되면서 아웃라인이 생기지 않음
- 왜 방 나가기 Dialog만, 그것도 새로고침을 하고 나면 그러는 거지?
- 나가기 버튼으로 나갈 때는 문제 없고 새로고침 후 뒤로가기 하면 그러는 것 같다. 뒤로가기 이벤트가 뭔가 영향을 주는 건가? 아무튼 AlertDialog 컴포넌트 자체에 처리

  ```jsx
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: 'outline' }), // outline 자체를 없애면 버튼 색상이 바뀜
      'mt-2 sm:mt-0',
      'focus:outline-none focus-visible:ring-0', // 포커스 스타일 제거
      className
    )}
    {...props}
  />
  ```

### 새로고침 지옥에서 꺼내줘

- 개발 시작 단계부터 날 괴롭게 했던 새로고침.. 재입장 처리로 어떻게 넘어갔었는데, 게임 중일 때는 막아야 함
- 키보드 동작은 막을 수 있는데 브라우저 새로고침 버튼 클릭은 막을 수 없음. Alert 띄우는 게 최선인데 이 Alert도 메시지 수정 불가.
- 채점 중에서 안 넘어가는 문제가 해결되지 않았다.
  - 계속 테스트해 보는데 음성 데이터 전달 중에 새로고침 하면 채점이 안 되고 결과를 못 받아와서 그런 것 같다.
- `beforeunload` 이벤트의 브라우저 기본 alert보다 먼저 혹은 동시에 CustomAlertDialog을 띄우는 것은 불가능함
  - 강퇴처럼 방 목록 페이지에 왔을 때 알림을 띄우기로 함
  - 이게 왜 잘 안되는 건지 모르겠다.. 강퇴랑 별다를 게 없는 거 같은데..🤯 나중에 고쳐보는 걸로
  - 페이지가 새로고침되면서 상태가 초기화되기 때문에 알림이 표시되지 않음. 강퇴 알림처럼 sessionStorage에 저장하고 가져와야 함

### 화요일 데일리스크럼 이슈 공유: 대기 중인 방에 링크로 입장 시 닉네임 설정 전에 마이크 권한 요청 및 오디오 연결되는 문제

- 방 목록 페이지에서 게임 방 클릭 시에는 제대로 동작하는데, 링크 입장 시에는 음성이 먼저 연결된다는 이슈를 전달받음
- 원인
  - 링크 입장 시 GamePage index.tsx의 useReconnect로 소켓 연결, 닉네임 설정, 유효성 검증, 각 서버에 join된다. (방 목록 페이지에서의 입장은 handleJoin)
  - 방 목록 페이지에서 게임 방 클릭 시에는 잘 동작한다는 말이 힌트가 되어줬다.
  - useReconnect에서 순서가 JoinDialog의 handleJoin의 순서와 달랐기 때문이다. 유효성 검증이 추가되고 gameSocket의 joinRoom도 비동기 함수로 바꾸고 했는데 useReconnect 훅에서 순서를 바꿔준다는 걸 잊어버렸다.
- 해결
  - useReconnect에서 각 함수 호출 순서를 handleJoin과 동일하게 맞춰서 해결..!
  - gameSocket.joinRoom에서 유효성 검증에 대한 에러를 발생시키고 있기 때문에 순서를 잘 생각해야 한다. 게임 중 새로고침, 게임 중인 방 링크 입장할 때는 입장 불가 알림 처리도 해야 했기 때문에 머리가 터져버리는 줄 알았다. 오죽했으면 손으로 써가면서 체크함,,😇
