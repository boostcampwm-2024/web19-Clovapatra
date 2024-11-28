## 🔍 문제 해결 과정

### 새로운 게임방이 추가될 때 순서대로 추가되지 않음

### useRoomStore 사용

- 훅/컴포넌트 내부에서 사용: useRoomStore()
- React 외부의 비동기 작업, 이벤트 핸들러: useRoomStore.getState()

### 게임 시작했을 때 Timer와 Lyric이 등장하는 타이밍이 맞지 않음

- startGame을 이미 했는데 Intro 화면을 2초 보여줘서 그런 건가 싶음
- 게임 시작 버튼 클릭했을 때 Intro 화면을 GameScreen에서 먼저 2초 띄우고, startGame을 하도록 하면 되려나?
- 원인: Lyric 애니메이션 duration이 timeLimit으로 설정해서, 가사 길이가 짧으면 늦게 등장하게 됐던 것이었다.
  - 가사의 길이를 동일하게 맞추지 않는 이상 등장하는 시간을 제한 시간과 완벽하게 맞출 수는 없을 것 같다.
- 해결: Lyric 애니메이션 delay 시간을 -0.5로 설정해서 길이가 짧은 가사는 게임 스크린 중앙쯤부터 등장하도록 했다.
  - 적어도 '가사가 왜 안 나오지?' 생각은 안 들 것 같다..!

### 게임 진행 UI 구현 문제: 실시간은 너무 어려워

- startGame을 하면 turnChanged로 다음 차례 사용자 데이터(turnData)를 받는다.
- startRecording을 하면 해당 차례 사용자의 음성 데이터를 전달하고 채점 결과(result)를 받는다.
- 그런데 startGame을 하면 이 turnData가 계속 들어온다.
- 이게 문제가 뭐냐면, 음성 데이터 전달 -> 채점 -> 결과 -> 다음 턴 이런 순서로 되어야 하는데, 결과를 받기도 전에 다음 turnData가 들어와서 결과를 보여줄 수 없어진다. (제발 아직 오지 마.. 제발)
- 난 이게 내 역량 부족이라고 생각해 금, 토 꼬박 12시간을 바쳐서 해결해 보려고 했다. setTimeout 떡칠을 하고, 정말 별짓을 다 했는데 안 됐다. 뭐라고 표현하면 좋을까. 쓰나미를 구멍 난 우산으로 막겠다고 까불다가 집도 절도 잃어버린 물에 빠진 생쥐 꼴이 된 거 같다고 해야 하나. 몸도 마음도 너덜너덜해졌다.
- 내가 하도 찡찡대서 백엔드 쪽에서 이벤트를 하나 더 만들어 주셨다. 주말에 죄송함니다 진성님. 그리고 저를 살려주셔서 감사합니다,,
- 이제 클라이언트에서 result를 받은 후 next 이벤트를 보내야 다음 turnData를 받게 된다. 이제 돼야 한다. 되겠지..?
- next 이벤트 쓰고 바로 잘 되는 줄 알았는데 채점 중에서 결과로 안 넘어가질 때가 있다. (안 될 때가 더 많다)
  - 잘 됐다가 안 됐다가 하는 게 너무 화가 난다,, 초반에 낚여서 PR 날릴 뻔 했네,, 진짜 사람 미치게 만드는구만
  - 발음 게임 채점이 제대로 안 됐던 거였다..! 휴우 내 잘못 아니라서 다행이다(?)

### 게임 종료됐는데, startRecording이 계속된다?

```tsx
// 턴 데이터 변경 시 게임 초기화
useEffect(() => {
  if (!turnData && !resultData) return;
// 순위 데이터가 있으면 종료시켜야 했는데..!
  if (rank.length > 0) return;

  ...
}, [turnData, currentRoom, currentPlayer]);
```

### react-router-dom 경고

정체: React Router v7에서 상대 경로의 해석 방식이 변경될 예정이고, 이를 사전에 알려주는 경고 메시지

```
react-router-dom.js?v=ceca9ee8:4374 ⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the v7_relativeSplatPath future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.
```

```
react-router-dom.js?v=ceca9ee8:4374 ⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in React.startTransition in v7. You can use the v7_startTransition future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.
```

최신 버전으로 업데이트하니까 경고 사라졌음

```bash
npm install react@latest react-dom@latest
```

업데이트하고 나서 라우팅 문제 생겨서 다운그레이드함.. 방 나가기 시 나가기 처리가 제대로 안 됨  
어떻게 해야 하는지 모르겠다ㅜㅜ

### VolumeBar 스피커 버튼을 토글하여 볼륨 0 ↔ 50으로 조절할 수 있도록 함

- 진성님이 피드백 주신 부분 반영

### 키보드 Enter로도 동작하도록 함

- Dialog에서 항상 마우스로 Input 필드를 눌러 입력하고, 확인 버튼을 클릭해야만 하는 게 불편했다.
- 그래서 다음과 같은 것들이 가능하도록 했다.
  - Dialog Open 시 첫 Input 필드에 포커싱
  - Input 필드가 여러 개인 경우 Enter로 다음 Input 필드 이동
  - Enter로 Submit(확인 버튼 클릭과 동일한 동작)
- shadcn/ui Dialog 컴포넌트는 ESC 키를 눌렀을 때 Dialog Close를 해줘서 이건 따로 처리가 필요 없었다.
- SearchBar(방 검색)에도 적용할 생각!

### 게임 진행 테스트 도중 버그 발견

- 본인 마이크 버튼을 음소거하면 setMute 이벤트를 보내고 updateUsers를 수신해 players 상태를 변경한다.
- 게임 진행 중에 이 마이크 버튼을 음소거하면 각 player의 isMuted 상태가 바뀌고, 이는 currentRoom의 상태를 바꿔 리렌더링 되면서 voice recording이 되지 않는다. (게임방을 나갔을 경우에도 동일, 이 부분은 나중에 해결하기로)
  - PlayScreen의 useEffect 의존성 배열에 currentRoom이 있어서 그런 것 같다.
- 그래서 일단 각 player에서 isMuted를 없애고, setMute 시 updateUsers가 아닌 muteStatusChanged 이벤트를 수신해 muteStatus: {닉네임: false/true, ...} 데이터를 받아온다.
- Player 컴포넌트 내부에 isMuted 초기 상태를 정해주고, muteStatus 데이터 상태가 변경되었을 때 isMuted를 변경해 주는 방식으로 바꿨다.
- 이렇게 해서 Player 컴포넌트와 GameScreen 컴포넌트를 독립적으로 리렌더링 해줄 수 있게 됐다.
- 문제: muteStatus의 initial state를 null로 설정하니까 처음에 가져올 때 에러 발생해서 빈 객체로 초기화

### 검색과 실시간성은 분리하자

- 한 사용자가 검색 중일 때 새로운 방이 생성되거나 삭제된 경우 이를 실시간으로 반영해서 필터링해야 하나 고민을 했다.
- 사용자 입장에서 필터링된 방이 갑자기 새로 생기거나 없어지는 게 이상할 것 같다는 생각이 들었다.
- 그래서 검색어를 지우면 1페이지의 방 목록을 보여주도록 함
  - 대신 검색으로 필터링된 방이 삭제된 경우에는 `삭제된 방입니다.`와 같은 알림을 띄우는 게 어떨까
  - 검색 중 필터링된 방이 삭제되면 에러 발생 -> 이 경우는 나중에 해결하기로
- 아.. 근데 1페이지가 꽉 차지 않은 경우에는 방 생성, 방 삭제 시 방 목록이 업데이트돼서 SSE로 리렌더링 될 텐데.. 하 모르겠다

### 실시간 통신 페이지네이션 이렇게 어려울 일이야?

- 페이지네이션 하려면 서버에서 전체 방 개수, 혹은 페이지 개수 등의 정보를 내려줘야 한다.
  - Taskify 할 때 엄청 고민했던 부분이었다. DB에 count 컬럼을 두고 관리했던..
- 그래야 페이지를 이동시킬 수 있고, 페이지를 이동할 수 있어야 해당 페이지 번호로 요청을 보내서, 해당 페이지의 방 목록을 받아와 렌더링 해줄 수 있기 때문이다.
- 그래서 데이터 구조도 바뀌었고, SSE 부분도 다 바꿔줘야 했다. 머리가 터질 것 같다.
  - SSE는 해결된 걸 확인하긴 했는데, REST API 쪽이 문제인 것 같다. 초기 데이터가 null로 오는 건가..? 나는 뭔지 모르겠다.
- 서버 쪽도 갑자기 많은 걸 바꿔서 그런지 자꾸 서버 에러가 나서, 나는 아무래도 기다려야 할 것 같다.🫠
- 원인을 알아냈다.
  - 지금 페이지네이션 버튼 생성은 REST API에 의존하고 있다. 위에서 말한 것처럼 전체 방 개수나, 총 페이지 개수를 받아와야 얘로 버튼을 만들 수 있고, 띄워줄 수 있다.
  - 초기 페이지 번호를 0으로 Store에서 가지고 있고(프론트에서 먼저 페이지네이션을 구현할 때 인덱스로 사용한 부분이 있어서 0으로 했음), 초기 데이터 가져올 때 이 상태 값을 가지고 REST API 요청하고 받아 온 데이터를 렌더링 해준다.
  - 지금 REST API 응답은 data: {rooms: [], pagination: {}} 구조인데, SSE 응답은 rooms 배열뿐이다.
  - 메인 페이지에 입장해서 방 생성, 삭제를 하지 않은 사용자에게 실시간으로 페이지네이션 버튼이 뜨도록 하려면 SSE 응답에도 pagination 정보, 적어도 현재 페이지 정보를 같이 받아와서 상태를 변경시켜 줄 수 있어야 한다. 그렇지 않으면 초기에 설정된 0(1페이지)으로만 계속 SSE 요청을 보내게 된다.
  - REST API를 또 요청하면 되지 않나? 싶어서 refetch도 시켜줬지만 무의미한 일이었다. 버튼이 생겨야 현재 페이지 상태를 변경시켜 줄 수 있기 때문이다.
  - 현재 상황에서 새로고침을 하지 않는 한 실시간으로 페이지네이션 버튼을 띄울 수 없는 것 같다는 게 결론이다..! -> 서버에 데이터 구조 맞춰서 내려달라고 요청함
