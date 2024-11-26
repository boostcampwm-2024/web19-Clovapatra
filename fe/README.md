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
